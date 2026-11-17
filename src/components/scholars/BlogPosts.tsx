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
  date?: string;
};
/** Home: the latest five posts. Resources → Blog: every post (`limit` unset), with an empty state. */
export function BlogPosts({
  limit = 5,
  heading = "From our journal",
  empty = null,
}: {
  limit?: number;
  heading?: string | null;
  empty?: React.ReactNode;
}) {
  const cmsLabel = useCmsLookup();

  // Newest date first (posts without a date go last).
  const posts = useCmsCollection<Blog>("blogs", [], (data, id) => ({ ...data, id }) as Blog)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, limit);
  const [selected, setSelected] = useState<string | null>(null);
  if (!posts.length) return <>{empty}</>;
  return (
    <section id="blog" className="mx-auto max-w-[1280px] px-5 py-20">
      {heading && <h2 className="font-heading text-3xl font-light">{heading}</h2>}
      <div className={`${heading ? "mt-8 " : ""}grid gap-6 md:grid-cols-2`}>
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-neutral-900/[0.08] bg-white p-7"
          >
            {post.image && (
              <img
                src={post.image}
                alt={cmsLabel("BlogPosts.label.e3b0c44298fc", "")}
                className="mb-5 aspect-video w-full rounded-xl object-cover"
                loading="lazy"
              />
            )}
            <h3 className="text-xl font-medium">{post.title}</h3>
            <p className="my-3 text-sm text-neutral-500">{post.author}</p>
            <p className="whitespace-pre-wrap text-neutral-600">
              {selected === post.id ? post.body : post.excerpt}
            </p>
            <button
              type="button"
              aria-expanded={selected === post.id}
              className="mt-5 font-medium text-blue-700"
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
