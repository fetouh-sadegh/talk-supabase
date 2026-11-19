import type { AuthUser, PositionFilter } from '@/src/lib/message-wall/types';
import { useTranslations } from 'next-intl';

interface ToolbarProps {
  searchQuery: string;
  positionFilter: PositionFilter;
  onSearchChange: (value: string) => void;
  onPositionFilterChange: (value: PositionFilter) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAddClick: () => void;
  authUser: AuthUser | null;
  availablePositions: string[];
}

export function Toolbar({
  searchQuery,
  positionFilter,
  onSearchChange,
  onPositionFilterChange,
  onLoginClick,
  onLogoutClick,
  onAddClick,
  authUser,
  availablePositions,
}: ToolbarProps) {
  const t = useTranslations('demo.toolbar');
  return (
    <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label htmlFor="message-search" className="sr-only">
            {t('searchLabel')}
          </label>
          <input
            id="message-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-sb-green/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="position-filter" className="sr-only">
            {t('filterLabel')}
          </label>
          <select
            id="position-filter"
            value={positionFilter}
            onChange={(event) => onPositionFilterChange(event.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black/35 px-2.5 text-sm text-white outline-none transition focus:border-sb-green/40"
          >
            <option value="All">{t('positions.all')}</option>
            {availablePositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>

          {!authUser ? (
            <button
              type="button"
              onClick={onLoginClick}
              className="h-10 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
            >
              {t('login')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogoutClick}
              className="h-10 rounded-lg border border-sb-green/30 bg-sb-green/10 px-3 text-sm text-sb-green transition hover:border-sb-green/50"
            >
              {t('logout')}
            </button>
          )}

          <button
            type="button"
            onClick={onAddClick}
            className="h-10 rounded-lg border border-sb-green/35 bg-sb-green/15 px-3 text-sm font-medium text-sb-green transition hover:border-sb-green/55"
          >
            {t('add')}
          </button>
        </div>
      </div>
    </div>
  );
}
