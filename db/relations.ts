import { relations } from "drizzle-orm";
import { authors, categories, articles, tags, articleTags } from "./schema";

export const authorsRelations = relations(authors, ({ many }) => ({
  articles: many(articles),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(authors, { fields: [articles.authorId], references: [authors.id] }),
  category: one(categories, { fields: [articles.categoryId], references: [categories.id] }),
  articleTags: many(articleTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, { fields: [articleTags.articleId], references: [articles.id] }),
  tag: one(tags, { fields: [articleTags.tagId], references: [tags.id] }),
}));
