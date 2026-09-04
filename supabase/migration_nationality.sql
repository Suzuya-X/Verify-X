-- Migration: Update synthetic registry to use realistic nationality and document type
-- Run this in your Supabase SQL Editor to apply the changes to existing live data.

UPDATE synthetic_registry
SET nationality = 'IND', document_type = 'passport'
WHERE nationality = 'DEMO';
