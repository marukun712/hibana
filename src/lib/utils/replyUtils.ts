import { eventType } from "../../../backend/schema/Event";
import { profileType } from "../../../backend/schema/Profile";

export type PostWithReplies = eventType & { 
  user: profileType;
  replies?: PostWithReplies[];
  depth?: number;
};

export function buildReplyTree(posts: (eventType & { user: profileType })[]): PostWithReplies[] {
  const postMap = new Map<string, PostWithReplies>();
  const rootPosts: PostWithReplies[] = [];
  
  // まず全ての投稿をマップに格納
  posts.forEach(post => {
    postMap.set(post.id, { ...post, replies: [] });
  });
  
  // リプライ関係を構築
  posts.forEach(post => {
    const postWithReplies = postMap.get(post.id)!;
    
    if (post.event === "event.reply" && post.target) {
      // リプライの場合、親投稿の replies 配列に追加
      const parentPost = postMap.get(post.target.id);
      if (parentPost) {
        parentPost.replies = parentPost.replies || [];
        parentPost.replies.push(postWithReplies);
      } else {
        // 親投稿が見つからない場合はルートレベルに表示
        rootPosts.push(postWithReplies);
      }
    } else {
      // 通常の投稿、リポスト、引用リポストはルートレベル
      rootPosts.push(postWithReplies);
    }
  });
  
  // リプライを時間順でソート
  function sortReplies(post: PostWithReplies) {
    if (post.replies && post.replies.length > 0) {
      post.replies.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      post.replies.forEach(sortReplies);
    }
  }
  
  rootPosts.forEach(sortReplies);
  
  return rootPosts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}