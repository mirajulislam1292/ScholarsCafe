import { useCmsLookup } from "@/lib/cms";
import { useState } from "react";
import { useCmsCollection } from "@/lib/cms";
type Blog = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  author: string;
  image: string;
};
export function BlogPosts() {
  const cmsLabel = useCmsLookup();

  const posts = useCmsCollection<Blog>("blogs", [], (data, id) => ({ ...data, id }) as Blog);
  const [selected, setSelected] = useState<string | null>(null);
  if (!posts.length) return null;
  return (
    <section id="blog" className="mx-auto max-w-[1280px] px-5 py-20">
      <h2 className="font-display text-3xl font-bold">From our journal</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-border bg-white p-7">
            {post.image && (
              <img
                src={post.image}
                alt={cmsLabel("BlogPosts.label.e3b0c44298fc", "")}
                className="mb-5 aspect-video w-full rounded-xl object-cover"
                loading="lazy"
              />
            )}
            <h3 className="text-xl font-bold">{post.title}</h3>
            <p className="my-3 text-sm text-slate-500">{post.author}</p>
            <p className="whitespace-pre-wrap text-slate-600">
              {selected === post.id ? post.body : post.excerpt}
            </p>
            <button
              type="button"
              aria-expanded={selected === post.id}
              className="mt-5 font-semibold text-sky-700"
              onClick={() => setSelected(selected === post.id ? null : post.id)}
            >
              {selected === post.id ? "Close article" : "Read article →"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
