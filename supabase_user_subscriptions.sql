-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NULL, -- Stripe subscription ID
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'pro', 'growth')),
  billing_interval TEXT NULL CHECK (billing_interval IN ('month', 'year')),
  current_period_start TIMESTAMPTZ NULL,
  current_period_end TIMESTAMPTZ NULL,
  canceled_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create unique index on user_id to ensure one subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);

-- Create index on subscription_id for webhook lookups
CREATE INDEX IF NOT EXISTS user_subscriptions_subscription_id_idx ON user_subscriptions(subscription_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON user_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment the table
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription information from Stripe';
COMMENT ON COLUMN user_subscriptions.subscription_id IS 'Stripe subscription ID (null for free plan)';
COMMENT ON COLUMN user_subscriptions.status IS 'Subscription status from Stripe';
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Plan type: free, starter, pro, growth';
COMMENT ON COLUMN user_subscriptions.billing_interval IS 'Billing interval: month or year (null for free)'; 