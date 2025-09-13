-- Create project_videos table
CREATE TABLE IF NOT EXISTS project_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  additional_notes TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own project videos" ON project_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project videos" ON project_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project videos" ON project_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project videos" ON project_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_videos_project_id ON project_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_videos_user_id ON project_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_project_videos_status ON project_videos(status);
