import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import type { SortBy } from '@/api/tmdbApi';
import { colors } from '@/theme/tokens';
import type { MediaType } from '@/types/common';
import { GenreChips } from '@/ui/molecules/GenreChips';
import { SortList } from '@/ui/molecules/SortList';

const CLOSE_ICON_SIZE = 20;
// Caps the sheet at roughly two thirds of a typical screen so the full
// genre chip grid + sort list scrolls inside it instead of overflowing
// off-screen on shorter devices.
const modalScrollStyle = { maxHeight: 480 };

type FiltersSheetProps = {
  onClose: () => void;
  mediaType: MediaType;
  genreId: number | null;
  onGenreChange: (genreId: number | null) => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
};

// The sheet's own content, split out from FiltersModal so neither
// component's JSX nests too deeply (Modal > Pressable > ScrollView is
// already 3 levels before any actual content starts).
const FiltersSheet = ({
  onClose,
  mediaType,
  genreId,
  onGenreChange,
  sortBy,
  onSortChange,
}: FiltersSheetProps) => {
  const { t } = useTranslation();

  return (
    <View className="gap-lg rounded-t-3xl bg-surface p-md">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-text">{t('filtersModal.title')}</Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.dismiss')}
          accessibilityHint={t('common.dismissHint')}
        >
          <Ionicons name="close" size={CLOSE_ICON_SIZE} color={colors.textMuted} />
        </Pressable>
      </View>
      <View className="gap-sm">
        <Text className="text-sm font-bold text-textMuted">{t('genreFilter.label')}</Text>
        <GenreChips mediaType={mediaType} value={genreId} onChange={onGenreChange} />
      </View>
      <View className="gap-sm">
        <Text className="text-sm font-bold text-textMuted">{t('sort.label')}</Text>
        <SortList value={sortBy} onChange={onSortChange} />
      </View>
    </View>
  );
};

type FiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  mediaType: MediaType;
  genreId: number | null;
  onGenreChange: (genreId: number | null) => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
};

// Single bottom-sheet combining genre + sort, opened from SearchBar's
// trailing filter icon — replaces two separate dropdown pills with one
// entry point, matching the original mockup's single filter icon at the
// end of the search bar. Taps inside the sheet only update local draft
// state — the real onGenreChange/onSortChange (which reset pagination and
// trigger a refetch in MoviesListScreen/TvListScreen) only fire once, on
// close, and only for whichever of the two actually changed. The sheet
// sits on top of the list the whole time it's open, so there was no
// visible benefit to querying on every tap, only wasted requests when a
// user tries a few options before settling on one.
export const FiltersModal = ({
  visible,
  onClose,
  mediaType,
  genreId,
  onGenreChange,
  sortBy,
  onSortChange,
}: FiltersModalProps) => {
  const { t } = useTranslation();
  const [draftGenreId, setDraftGenreId] = useState(genreId);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);

  // Re-sync the draft to the committed values whenever the sheet opens —
  // otherwise a draft left over from a prior open/close could leak in
  // before the user touches anything this time.
  useEffect(() => {
    if (visible) {
      setDraftGenreId(genreId);
      setDraftSortBy(sortBy);
    }
  }, [visible, genreId, sortBy]);

  const handleClose = () => {
    if (draftGenreId !== genreId) {
      onGenreChange(draftGenreId);
    }
    if (draftSortBy !== sortBy) {
      onSortChange(draftSortBy);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        className="flex-1 justify-end bg-black/60"
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.dismiss')}
        accessibilityHint={t('common.dismissHint')}
      >
        <ScrollView style={modalScrollStyle}>
          <FiltersSheet
            onClose={handleClose}
            mediaType={mediaType}
            genreId={draftGenreId}
            onGenreChange={setDraftGenreId}
            sortBy={draftSortBy}
            onSortChange={setDraftSortBy}
          />
        </ScrollView>
      </Pressable>
    </Modal>
  );
};
