import { TrendingUp, Coins, Award, type LucideIcon } from 'lucide-react';

/**
 * Landing Page Feature Cards Data
 */

export interface FeatureData {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  number: string;
}

export const FEATURES: FeatureData[] = [
  {
    icon: TrendingUp,
    iconColor: 'text-btc',
    iconBgColor: 'bg-btc/10 border border-btc/20',
    title: 'Bitcoin Alignment',
    description:
      'Bet on orange coin supremacy. Higher volatility means higher rewards.',
    number: '01',
  },
  {
    icon: Coins,
    iconColor: 'text-eth',
    iconBgColor: 'bg-eth/10 border border-eth/20',
    title: 'Ethereum Alignment',
    description:
      'Join the blue side. Stability and smart contracts lead to consistent gains.',
    number: '02',
  },
  {
    icon: Award,
    iconColor: 'text-secondary',
    iconBgColor: 'bg-secondary/10 border border-secondary/20',
    title: 'Daily Missions',
    description:
      'Complete challenges to earn $CHURR tokens and unlock special rewards.',
    number: '03',
  },
];

