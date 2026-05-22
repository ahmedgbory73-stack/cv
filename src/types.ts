export interface Developer {
  id: string;
  name: string;
  avatarText: string;
  avatarColor: string;
  role: string;
  roleDescription: string;
  status: string;
  lastMessage: string;
  lastActive: string;
}

export interface Message {
  id: string;
  sender: "me" | "bot" | "info";
  text: string;
  time: string;
  isAudio?: boolean;
  audioDuration?: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  subscribersCount: number;
  icon: string;
  posts: ChannelPost[];
}

export interface ChannelPost {
  id: string;
  author: string;
  text: string;
  time: string;
  likes: number;
  comments: number;
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio: string;
}
