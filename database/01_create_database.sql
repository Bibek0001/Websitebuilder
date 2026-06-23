-- Personal Website SaaS Platform
-- SQL Server Express Setup Script

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalWebsiteDB')
BEGIN
    CREATE DATABASE PersonalWebsiteDB;
END
GO

USE PersonalWebsiteDB;
GO

-- EF Core will handle table creation via migrations.
-- This script ensures the database exists before running the app.

PRINT 'Database PersonalWebsiteDB is ready.';
GO
