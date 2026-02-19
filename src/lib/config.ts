// TypeScript interfaces for Saraylı Döner configuration

export interface MenuItem {
	id: number;
	nameKey: string;
	price: number;
	descKey?: string;
	sizeKey?: string;
	image?: string;
}

export interface MenuCategory {
	id: string;
	name: string;
	items: MenuItem[];
}

export interface Review {
	name: string;
	rating: number;
	textKey: string;
}

export interface BusinessInfo {
	name: string;
	address: string;
	phone: string;
	hours: string;
	googleRating: number;
	googleReviewCount: number;
	googleMapsUrl: string;
	instagramUrl: string;
	instagramHandle: string;
	instagramReelUrl: string;
	tiktokUrl: string;
	tiktokHandle: string;
}

// Menu categories with all 33 items
export const menuCategories: MenuCategory[] = [
	{
		id: 'doener',
		name: 'DÖNER SPEZIALITÄTEN',
		items: [
			{
				id: 1,
				nameKey: 'menu_item_1_name',
				price: 8.0,
				descKey: 'menu_item_1_desc',
				image: '/images/kebab-small.webp'
			},
			{ id: 2, nameKey: 'menu_item_2_name', price: 12.0, descKey: 'menu_item_2_desc' },
			{ id: 3, nameKey: 'menu_item_3_name', price: 6.0 },
			{ id: 4, nameKey: 'menu_item_4_name', price: 9.0, descKey: 'menu_item_4_desc' },
			{
				id: 5,
				nameKey: 'menu_item_5_name',
				price: 8.0,
				descKey: 'menu_item_5_desc',
				image: '/images/kebab-fries.webp'
			},
			{ id: 6, nameKey: 'menu_item_6_name', price: 11.0, descKey: 'menu_item_6_desc' },
			{
				id: 7,
				nameKey: 'menu_item_7_name',
				price: 14.0,
				descKey: 'menu_item_7_desc',
				image: '/images/kebab-plate-large.webp'
			},
			{ id: 8, nameKey: 'menu_item_8_name', price: 18.0, descKey: 'menu_item_8_desc' }
		]
	},
	{
		id: 'teig',
		name: 'TEIG SPEZIALITÄTEN',
		items: [
			{ id: 9, nameKey: 'menu_item_9_name', price: 4.0, descKey: 'menu_item_9_desc' },
			{ id: 10, nameKey: 'menu_item_10_name', price: 5.0, descKey: 'menu_item_10_desc' },
			{ id: 11, nameKey: 'menu_item_11_name', price: 10.0, descKey: 'menu_item_11_desc' }
		]
	},
	{
		id: 'imbiss',
		name: 'IMBISS SPEZIALITÄTEN',
		items: [
			{ id: 12, nameKey: 'menu_item_12_name', price: 2.5 },
			{ id: 13, nameKey: 'menu_item_13_name', price: 4.0 },
			{ id: 14, nameKey: 'menu_item_14_name', price: 5.0, descKey: 'menu_item_14_desc' },
			{ id: 15, nameKey: 'menu_item_15_name', price: 3.0 },
			{ id: 16, nameKey: 'menu_item_16_name', price: 7.0 }
		]
	},
	{
		id: 'suppen',
		name: 'SUPPEN',
		items: [
			{ id: 17, nameKey: 'menu_item_17_name', price: 5.0, descKey: 'menu_item_17_desc' },
			{ id: 18, nameKey: 'menu_item_18_name', price: 7.0, descKey: 'menu_item_18_desc' }
		]
	},
	{
		id: 'salat',
		name: 'SALAT',
		items: [
			{ id: 19, nameKey: 'menu_item_19_name', price: 4.0, descKey: 'menu_item_19_desc' },
			{ id: 20, nameKey: 'menu_item_20_name', price: 4.5 }
		]
	},
	{
		id: 'extras',
		name: 'EXTRAS',
		items: [
			{ id: 21, nameKey: 'menu_item_21_name', price: 0.5 },
			{ id: 22, nameKey: 'menu_item_22_name', price: 2.0, sizeKey: 'menu_item_22_size' },
			{ id: 23, nameKey: 'menu_item_23_name', price: 2.0, sizeKey: 'menu_item_23_size' },
			{ id: 24, nameKey: 'menu_item_24_name', price: 2.0, sizeKey: 'menu_item_24_size' },
			{ id: 25, nameKey: 'menu_item_25_name', price: 1.0, sizeKey: 'menu_item_25_size' },
			{ id: 26, nameKey: 'menu_item_26_name', price: 4.0, sizeKey: 'menu_item_26_size' }
		]
	},
	{
		id: 'getraenke',
		name: 'GETRÄNKE',
		items: [
			{ id: 27, nameKey: 'menu_item_27_name', price: 2.5, sizeKey: 'menu_item_27_size' },
			{ id: 28, nameKey: 'menu_item_28_name', price: 2.5, sizeKey: 'menu_item_28_size' },
			{ id: 29, nameKey: 'menu_item_29_name', price: 2.5, sizeKey: 'menu_item_29_size' },
			{ id: 30, nameKey: 'menu_item_30_name', price: 2.0, sizeKey: 'menu_item_30_size' },
			{ id: 31, nameKey: 'menu_item_31_name', price: 2.0, sizeKey: 'menu_item_31_size' },
			{ id: 32, nameKey: 'menu_item_32_name', price: 2.0, sizeKey: 'menu_item_32_size' },
			{ id: 33, nameKey: 'menu_item_33_name', price: 1.5, sizeKey: 'menu_item_33_size' }
		]
	}
];

// Customer reviews (all 5/5 stars)
export const reviews: Review[] = [
	{ name: 'hossam Khalefa', rating: 5, textKey: 'review_0_text' },
	{ name: 'Saliha', rating: 5, textKey: 'review_1_text' },
	{ name: 'Betül Burulday', rating: 5, textKey: 'review_2_text' },
	{ name: 'Elhame Kurteshi', rating: 5, textKey: 'review_3_text' },
	{ name: 'Ammar', rating: 5, textKey: 'review_4_text' },
	{ name: 'Ela Özer', rating: 5, textKey: 'review_5_text' },
	{ name: 'Hafize Gülsen', rating: 5, textKey: 'review_6_text' },
	{ name: 'Gökhan', rating: 5, textKey: 'review_7_text' },
	{ name: 'Dincer Bayramci', rating: 5, textKey: 'review_8_text' },
	{ name: 'Sxrhvt', rating: 5, textKey: 'review_9_text' },
	{ name: 'Murat Arslan', rating: 5, textKey: 'review_10_text' },
	{ name: 'Mustafa Burulday', rating: 5, textKey: 'review_11_text' },
	{ name: 'Ricco Simic', rating: 5, textKey: 'review_12_text' },
	{ name: 'Mustafa Demirci', rating: 5, textKey: 'review_13_text' },
	{ name: 'Bawer Amin', rating: 5, textKey: 'review_14_text' },
	{ name: 'Muhammed Cavdarci', rating: 5, textKey: 'review_15_text' },
	{ name: 'Ümmügülsüm Cevik', rating: 5, textKey: 'review_16_text' },
	{ name: 'Munzer Sy', rating: 5, textKey: 'review_17_text' },
	{ name: 'GÖKHAN Zidan', rating: 5, textKey: 'review_18_text' },
	{ name: 'Sema Parmak', rating: 5, textKey: 'review_19_text' },
	{ name: 'Gülay Kalbur', rating: 5, textKey: 'review_20_text' },
	{ name: 'Pierre-Maurice Merckel', rating: 5, textKey: 'review_21_text' },
	{ name: 'Sevval Parmak', rating: 5, textKey: 'review_22_text' }
];

// Business information
export const businessInfo: BusinessInfo = {
	name: 'Saraylı Döner',
	address: 'Horster Str. 372, 45968 Gladbeck',
	tiktokUrl: 'https://www.tiktok.com/@sarayli.doener',
	tiktokHandle: '@sarayli.doener',
	phone: '0 20 43 / 376 40 90',
	hours: 'Täglich 11:00 – 22:00',
	googleRating: 4.9,
	googleReviewCount: 62,
	googleMapsUrl: 'https://maps.app.goo.gl/ykoztaz2A56ooWcP8',
	instagramUrl: 'https://www.instagram.com/sarayli.doener',
	instagramHandle: '@sarayli.doener',
	instagramReelUrl: 'https://www.instagram.com/reel/DU1eOftiBmK/'
};
