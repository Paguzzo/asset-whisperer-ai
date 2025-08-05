-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule automatic market data collection every 15 minutes
SELECT cron.schedule(
  'collect-market-data-15min',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://azitogggugktqavcnvbn.supabase.co/functions/v1/collect-market-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aXRvZ2dndWdrdHFhdmNudmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjE2MTcsImV4cCI6MjA2OTYzNzYxN30.wXMq1qXKxQ70zLVqVp-fXK9D7j03kWkgFh1HSVJtk_A"}'::jsonb,
        body:='{"interval": "15min"}'::jsonb
    ) as request_id;
  $$
);

-- Schedule automatic market data collection every 4 hours
SELECT cron.schedule(
  'collect-market-data-4h',
  '0 */4 * * *', -- every 4 hours
  $$
  SELECT
    net.http_post(
        url:='https://azitogggugktqavcnvbn.supabase.co/functions/v1/collect-market-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aXRvZ2dndWdrdHFhdmNudmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjE2MTcsImV4cCI6MjA2OTYzNzYxN30.wXMq1qXKxQ70zLVqVp-fXK9D7j03kWkgFh1HSVJtk_A"}'::jsonb,
        body:='{"interval": "4h"}'::jsonb
    ) as request_id;
  $$
);

-- Schedule automatic market data collection daily
SELECT cron.schedule(
  'collect-market-data-daily',
  '0 0 * * *', -- every day at midnight
  $$
  SELECT
    net.http_post(
        url:='https://azitogggugktqavcnvbn.supabase.co/functions/v1/collect-market-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aXRvZ2dndWdrdHFhdmNudmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjE2MTcsImV4cCI6MjA2OTYzNzYxN30.wXMq1qXKxQ70zLVqVp-fXK9D7j03kWkgFh1HSVJtk_A"}'::jsonb,
        body:='{"interval": "daily"}'::jsonb
    ) as request_id;
  $$
);