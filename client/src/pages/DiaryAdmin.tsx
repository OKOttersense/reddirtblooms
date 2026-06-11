/**
 * Red Dirt Blooms — Bloom Diary Admin
 * Owner-only panel for creating, editing, and publishing diary posts (videos + blog).
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Save,
  Video, FileText, Tag, Globe, Lock, ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

type PostForm = {
  title: string;
  body: string;
  videoUrl: string;
  thumbnailUrl: string;
  tags: string;
  published: boolean;
};

const EMPTY_FORM: PostForm = {
  title: "",
  body: "",
  videoUrl: "",
  thumbnailUrl: "",
  tags: "",
  published: false,
};

export default function DiaryAdmin() {
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const postsQuery = trpc.diary.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.diary.create.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setShowForm(false);
      setForm(EMPTY_FORM);
      postsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.diary.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated!");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      postsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.diary.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted.");
      setDeleteConfirm(null);
      postsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const togglePublish = (post: { id: number; published: boolean }) => {
    updateMutation.mutate({ id: post.id, published: !post.published });
  };

  const startEdit = (post: {
    id: number; title: string; body: string | null; videoUrl: string | null;
    thumbnailUrl: string | null; tags: string | null; published: boolean;
  }) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      body: post.body ?? "",
      videoUrl: post.videoUrl ?? "",
      thumbnailUrl: post.thumbnailUrl ?? "",
      tags: post.tags ?? "",
      published: post.published,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        title: form.title,
        body: form.body || undefined,
        videoUrl: form.videoUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        tags: form.tags || undefined,
        published: form.published,
      });
    } else {
      createMutation.mutate({
        title: form.title,
        body: form.body || undefined,
        videoUrl: form.videoUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        tags: form.tags || undefined,
        published: form.published,
      });
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F5F0E8] pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-[#2A1F1A] font-bold text-2xl mb-2">Admin Only</h2>
          <Link href="/" className="font-body text-sm text-[#B5451B] hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Header */}
      <div className="bg-[#2A1F1A] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="font-accent text-[#E8A020] text-sm mb-0.5">Admin</div>
                <h1 className="font-heading text-[#F5F0E8] font-bold text-2xl">Bloom Diary</h1>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-white rounded border border-[#B5451B]/20 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-[#2A1F1A] font-semibold text-lg">
                {editingId !== null ? "Edit Post" : "New Diary Post"}
              </h2>
              <button onClick={cancelForm} className="text-[#2A1F1A]/30 hover:text-[#B5451B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="First zinnias of the season are popping!"
                  required
                  className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">
                  Post Body / Description
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Tell the story of what's happening on the farm today..."
                  rows={4}
                  className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B] resize-none"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">
                  <Video className="w-3.5 h-3.5 inline mr-1" />
                  Video URL (YouTube, Instagram, TikTok, or direct .mp4)
                </label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="zinnias, harvest, spring update"
                  className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
                />
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.published ? "bg-[#7A8C6E]" : "bg-[#2A1F1A]/20"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.published ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="font-body text-sm text-[#2A1F1A]/70">
                  {form.published ? (
                    <span className="flex items-center gap-1 text-[#7A8C6E]"><Globe className="w-3.5 h-3.5" /> Published — visible on the Bloom Diary</span>
                  ) : (
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Draft — only you can see this</span>
                  )}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body text-sm font-semibold px-5 py-2.5 rounded transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId !== null ? "Save Changes" : "Create Post"}
                </button>
                <button type="button" onClick={cancelForm} className="font-body text-sm text-[#2A1F1A]/50 hover:text-[#2A1F1A] px-4 py-2.5 rounded transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {postsQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" />
          </div>
        ) : (postsQuery.data ?? []).length === 0 ? (
          <div className="bg-white rounded border border-[#B5451B]/10 py-16 text-center">
            <Video className="w-10 h-10 text-[#B5451B]/20 mx-auto mb-3" />
            <h3 className="font-heading text-[#2A1F1A] font-semibold text-lg mb-1">No posts yet</h3>
            <p className="font-body text-sm text-[#2A1F1A]/40 mb-4">Click "New Post" to add your first Bloom Diary entry.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(postsQuery.data ?? []).map((post) => (
              <div key={post.id} className="bg-white rounded border border-[#B5451B]/10 p-4 flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded bg-[#F5F0E8] flex-shrink-0 overflow-hidden">
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {post.videoUrl ? <Video className="w-6 h-6 text-[#B5451B]/30" /> : <FileText className="w-6 h-6 text-[#B5451B]/30" />}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-heading text-[#2A1F1A] font-semibold text-base leading-tight truncate">{post.title}</h3>
                    <span className={`flex-shrink-0 font-body text-[10px] font-semibold px-1.5 py-0.5 rounded ${post.published ? "bg-[#7A8C6E]/10 text-[#7A8C6E]" : "bg-[#2A1F1A]/10 text-[#2A1F1A]/50"}`}>
                      {post.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  {post.body && (
                    <p className="font-body text-xs text-[#2A1F1A]/50 line-clamp-1 mb-1">{post.body}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] font-body text-[#2A1F1A]/30">
                    {post.tags && <span><Tag className="w-3 h-3 inline mr-0.5" />{post.tags}</span>}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(post)}
                    disabled={updateMutation.isPending}
                    title={post.published ? "Unpublish" : "Publish"}
                    className={`p-1.5 rounded transition-colors ${post.published ? "text-[#7A8C6E] hover:bg-[#7A8C6E]/10" : "text-[#2A1F1A]/30 hover:bg-[#2A1F1A]/5"}`}
                  >
                    {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(post)}
                    title="Edit"
                    className="p-1.5 rounded text-[#2A1F1A]/30 hover:text-[#B5451B] hover:bg-[#B5451B]/5 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === post.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate({ id: post.id })}
                        disabled={deleteMutation.isPending}
                        className="font-body text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded bg-red-50"
                      >
                        {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="font-body text-xs text-[#2A1F1A]/40 px-2 py-1">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(post.id)}
                      title="Delete"
                      className="p-1.5 rounded text-[#2A1F1A]/20 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
