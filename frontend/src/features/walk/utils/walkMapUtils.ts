export function spotMarkerImage(type: string): string {
    switch (type) {
        case 'PEE': return '/assets/images/walk/marker_pee.png';
        case 'POOP': return '/assets/images/walk/marker_poop.png';
        case 'PHOTO': return '/assets/images/walk/marker_camera.png';
        default: return '/assets/images/walk/marker_pee.png';
    }
}

export function spotTypeLabel(type: string): string {
    switch (type) {
        case 'PEE': return '쉬';
        case 'POOP': return '응가';
        case 'PHOTO': return '사진';
        case 'PROBLEM': return '문제';
        default: return '기타';
    }
}

export function spotTypeMarkerIcon(type: string): string {
    return spotMarkerImage(type);
}

export function formatSpotTimestamp(ts: string): string {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${h}:${min}`;
}

export function petCircleMarkerHtml(variant: 'start' | 'end', imageUrl?: string | null): string {
    const imgSrc = imageUrl || '/assets/images/common/pet_none_img.svg';
    return `<div class="walk_pet_circle walk_pet_circle--${variant}"><img src="${imgSrc}" alt="" /></div>`;
}
