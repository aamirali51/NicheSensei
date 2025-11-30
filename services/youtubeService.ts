
import { RealChannelData } from '../types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to parse ISO 8601 duration (e.g., PT15M33S) to "15:33"
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '00:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes.padStart(2, '0')}:`;
  result += `${seconds.padStart(2, '0')}`;
  
  // Clean up leading 00: if hours exist or simple minute display
  if (result.startsWith('00:') && result.length > 5) {
      result = result.substring(3);
  }
  return result.replace(/^0+/, '') || '0:00'; // extremely basic cleanup
}

export const getChannelIdFromUrl = async (urlOrHandle: string, apiKey: string): Promise<string | null> => {
  let endpoint = `${BASE_URL}/channels?key=${apiKey}`;
  
  // 1. Check if it's a channel ID directly
  if (urlOrHandle.startsWith('UC')) {
    return urlOrHandle;
  }

  // 2. Check for handle (e.g., @MrBeast)
  if (urlOrHandle.includes('@')) {
    const handle = urlOrHandle.split('@')[1].split('/')[0];
    const res = await fetch(`${endpoint}&forHandle=@${handle}&part=id`);
    const data = await res.json();
    return data.items?.[0]?.id || null;
  }

  // 3. Check for username (legacy)
  if (urlOrHandle.includes('/user/')) {
     const username = urlOrHandle.split('/user/')[1].split('/')[0];
     const res = await fetch(`${endpoint}&forUsername=${username}&part=id`);
     const data = await res.json();
     return data.items?.[0]?.id || null;
  }

  // 4. Check for search query if plain text
  const res = await fetch(`${BASE_URL}/search?key=${apiKey}&q=${encodeURIComponent(urlOrHandle)}&type=channel&part=id&maxResults=1`);
  const data = await res.json();
  return data.items?.[0]?.id?.channelId || null;
};

export const fetchRealChannelData = async (channelId: string, apiKey: string): Promise<RealChannelData> => {
  // 1. Get Channel Stats & Uploads Playlist ID
  const chanRes = await fetch(`${BASE_URL}/channels?key=${apiKey}&id=${channelId}&part=snippet,contentDetails,statistics`);
  const chanData = await chanRes.json();
  const channelItem = chanData.items?.[0];

  if (!channelItem) throw new Error('Channel not found');

  const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

  // 2. Get Recent Videos from Uploads Playlist
  const playlistRes = await fetch(`${BASE_URL}/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=contentDetails&maxResults=50`);
  const playlistData = await playlistRes.json();
  
  if (!playlistData.items) return {
      id: channelId,
      title: channelItem.snippet.title,
      stats: channelItem.statistics,
      videos: []
  };

  const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');

  // 3. Get Video Statistics (Views, Likes, Duration)
  const vidRes = await fetch(`${BASE_URL}/videos?key=${apiKey}&id=${videoIds}&part=snippet,statistics,contentDetails`);
  const vidData = await vidRes.json();

  const videos = vidData.items.map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
    publishedAt: v.snippet.publishedAt,
    stats: {
        viewCount: v.statistics.viewCount,
        likeCount: v.statistics.likeCount,
        commentCount: v.statistics.commentCount
    },
    duration: parseDuration(v.contentDetails.duration)
  }));

  return {
    id: channelId,
    title: channelItem.snippet.title,
    stats: {
        viewCount: channelItem.statistics.viewCount,
        subscriberCount: channelItem.statistics.subscriberCount,
        videoCount: channelItem.statistics.videoCount
    },
    videos
  };
};
