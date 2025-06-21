import { Metadata } from 'next';
import ChangelogPageContent from '@/components/changelog-content';

export const metadata: Metadata = {
  title: 'Our Roadmap | easybudget.ing',
  description: 'A look at the exciting features we\'re planning to build for EasyBudget. Your feedback can shape our priorities!',
};

export default function ChangelogPage() {
  return <ChangelogPageContent />;
} 