import { z } from "zod";

export const SourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  image: z.string().url().optional().nullable(),
});

export const AuthorSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    image: z.string().url().optional().nullable(),
    username: z.string().optional(),
  })
  .nullable()
  .optional();

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  image: z.string().url().optional().nullable(),
  summary: z.string().optional().nullable(),
  type: z.string().optional(),
  publishedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  commentsPermalink: z.string().url().optional().nullable(),
  source: SourceSchema.optional(),
  tags: z.array(z.string()).optional().default([]),
  readTime: z.number().optional().nullable(),
  numUpvotes: z.number().optional().default(0),
  numComments: z.number().optional().default(0),
  author: AuthorSchema,
});

export const FeedSchema = z.object({
  data: z.array(PostSchema),
  pagination: z
    .object({
      hasNextPage: z.boolean().optional(),
      cursor: z.string().nullable().optional(),
    })
    .optional(),
});

export const PostEnvelopeSchema = z.object({ data: PostSchema });

export type Source = z.infer<typeof SourceSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Feed = z.infer<typeof FeedSchema>;
