-- Add dashboard_id column to transactions table
ALTER TABLE transactions ADD COLUMN dashboard_id UUID REFERENCES dashboards(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX transactions_dashboard_id_idx ON transactions(dashboard_id);

-- Update RLS policies to include dashboard_id
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON COLUMN transactions.dashboard_id IS 'Reference to the dashboard this transaction belongs to. If NULL, the transaction belongs to the default dashboard.'; 