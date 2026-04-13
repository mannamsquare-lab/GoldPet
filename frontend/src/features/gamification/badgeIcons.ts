import firstWalk from '../../assets/badges/badge-first-walk.svg';
import neighborhood from '../../assets/badges/badge-neighborhood.svg';
import marathoner from '../../assets/badges/badge-marathoner.svg';
import popular from '../../assets/badges/badge-popular.svg';
import firstFamily from '../../assets/badges/badge-first-family.svg';
import walkMania from '../../assets/badges/badge-walk-mania.svg';
import firstPost from '../../assets/badges/badge-first-post.svg';
import communityStar from '../../assets/badges/badge-community-star.svg';
import empathy from '../../assets/badges/badge-empathy.svg';
import hotplace from '../../assets/badges/badge-hotplace.svg';

const BADGE_ICON_BY_NAME: Record<string, string> = {
  '첫 걸음': firstWalk,
  '동네 한 바퀴': neighborhood,
  '마라토너': marathoner,
  '핵인싸': popular,
  '첫 가족': firstFamily,
  '산책 마니아': walkMania,
  '소통의 시작': firstPost,
  '커뮤니티 스타': communityStar,
  '공감 한마디': empathy,
  '핫플 탐험가': hotplace,
};

export function getBadgeIcon(name: string | undefined | null): string | null {
  if (!name) return null;
  return BADGE_ICON_BY_NAME[name] ?? null;
}
