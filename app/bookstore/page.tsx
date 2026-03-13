import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";
import { getCachedPublicStories } from "@/lib/data-cache";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";

interface BookstorePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BookstorePage({ searchParams }: BookstorePageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const { stories, pagination } = await getCachedPublicStories(currentPage, 12);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                <BookOpen className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl font-black mb-4">The Bookstore</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover magical stories created by our community. 
              Each tale is uniquely crafted with love and imagination.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search stories by title or moral..."
              className="h-14 pl-12 text-lg rounded-full border-2 shadow-lg"
            />
          </div>
        </div>

        {/* Stories Grid */}
        <div className="container mx-auto px-4 py-12">
          <Suspense fallback={<BookstoreGridSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story) => (
                <Link key={story.id} href={`/bookstore/${story.id}`}>
                  <article className="group bg-white rounded-3xl border-2 border-muted overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                    {/* Cover Image */}
                    <div className="aspect-[4/3] relative bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                      {story.coverImage ? (
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        A story about {story.childName}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          By {story.authorName}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                          {story.pageCount} pages
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </Suspense>

          {/* Empty State */}
          {stories.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">No Stories Yet</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to share your magical story with the world!
              </p>
              <Link href="/create">
                <Button size="lg" className="rounded-full px-8">
                  Create a Story
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {/* Previous Button */}
              {currentPage > 1 && (
                <Link href={`/bookstore?page=${currentPage - 1}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-10 px-4"
                  >
                    Previous
                  </Button>
                </Link>
              )}
              
              {/* Page Numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Link key={page} href={`/bookstore?page=${page}`}>
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className="rounded-full h-10 w-10"
                    >
                      {page}
                    </Button>
                  </Link>
                )
              )}
              
              {/* Next Button */}
              {currentPage < pagination.totalPages && (
                <Link href={`/bookstore?page=${currentPage + 1}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-10 px-4"
                  >
                    Next
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BookstoreGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border-2 border-muted overflow-hidden shadow-sm"
        >
          <div className="aspect-[4/3] bg-muted animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
