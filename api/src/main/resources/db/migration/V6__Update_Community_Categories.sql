-- V6__Update_Community_Categories.sql
-- Updates community categories to: 만남, 의료, 쇼핑, 팻그램
-- WARNING: This will DELETE existing community posts and related data to avoid foreign key conflicts.
-- 1. Delete dependent data (children of posts)
DELETE FROM community_post_likes;
DELETE FROM community_post_images;
DELETE FROM community_comments;
-- Comments might reference themselves (parent_comment_id), but DELETE handles this usually if no restriction. If needed, we can cascade or delete in order.
-- Since it's a simple setup, just delete all comments.
-- 2. Delete posts
DELETE FROM community_posts;
-- 3. Delete existing categories
DELETE FROM community_categories;
-- 4. Insert new categories
INSERT INTO community_categories (code, name)
VALUES ('MEETING', '만남'),
    ('MEDICAL', '의료'),
    ('SHOPPING', '쇼핑'),
    ('PETGRAM', '팻그램');