import { X } from 'lucide-react';
import { CLAN, CLAN_NAMES, CLAN_COLORS, CLAN_ICONS } from '../constants';

interface ClanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (clan: number) => void;
  isLoading?: boolean;
}

const MAIN_CLANS = [CLAN.BTC, CLAN.ETH, CLAN.SOL]; // 발표에서 언급된 메인 진영

export function ClanSelectionModal({
  isOpen,
  onClose,
  onSelect,
  isLoading = false,
}: ClanSelectionModalProps) {
  if (!isOpen) return null;

  const handleSelect = (clan: number) => {
    if (!isLoading) {
      onSelect(clan);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative glass p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">진영 선택</h2>
            <p className="text-white/60">
              당신의 고양이가 속할 진영을 선택하세요
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Clan Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {MAIN_CLANS.map(clan => (
            <button
              key={clan}
              onClick={() => handleSelect(clan)}
              disabled={isLoading}
              className="glass-hover p-6 flex flex-col items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: `${CLAN_COLORS[clan]}40`,
              }}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold"
                style={{
                  backgroundColor: `${CLAN_COLORS[clan]}20`,
                  color: CLAN_COLORS[clan],
                }}
              >
                {CLAN_ICONS[clan]}
              </div>

              {/* Name */}
              <div className="text-center">
                <h3 className="text-xl font-bold">{CLAN_NAMES[clan]}</h3>
                <div
                  className="text-sm mt-1"
                  style={{ color: CLAN_COLORS[clan] }}
                >
                  {clan === CLAN.BTC && '변동성의 왕'}
                  {clan === CLAN.ETH && '스마트 컨트랙트의 제왕'}
                  {clan === CLAN.SOL && '고속 거래의 챔피언'}
                </div>
              </div>

              {/* Power Indicator */}
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${clan === CLAN.BTC ? 90 : clan === CLAN.ETH ? 85 : 80}%`,
                    backgroundColor: CLAN_COLORS[clan],
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Coming Soon Clans */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white/40 mb-3">
            Coming Soon
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[CLAN.LINK, CLAN.DOGE, CLAN.PEPE].map(clan => (
              <div
                key={clan}
                className="glass p-4 opacity-50 flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: `${CLAN_COLORS[clan]}20`,
                    color: CLAN_COLORS[clan],
                  }}
                >
                  {CLAN_ICONS[clan]}
                </div>
                <span className="text-xs text-white/60">{CLAN_NAMES[clan]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping delay-75" />
              <div className="w-3 h-3 bg-accent rounded-full animate-ping delay-150" />
              <span className="ml-2 text-white font-medium">민팅 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

