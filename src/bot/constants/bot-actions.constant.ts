/** Main menu (reply keyboard) — category-less single product list */
export const MAIN_MENU_ORDER_BUTTON = '🛍 Buyurtma berish';
export const MAIN_MENU_CART_BUTTON = '🛒 Savat';
export const MAIN_MENU_MY_ORDERS_BUTTON = '📦 Buyurtmalarim';
export const MAIN_MENU_INFO_BUTTON = "ℹ️ Ma'lumot";

/** Legacy / alternate labels (for backward compatibility) */
export const CART_MENU_BUTTON = '🛒 Savat';
export const CART_ADD_BUTTON = "🛒 Savatga qo'shish";
export const CART_MENU_BUTTON_LEGACY = 'Savatim';

/** Category reply keyboard labels (kept if still used elsewhere) */
export const CATEGORY_FACE = '🧴 Yuz parvarishi';
export const CATEGORY_COSMETICS = '💄 Kosmetika';
export const CATEGORY_CART = '🛒 Savat';
export const CATEGORY_CONTACT = '📞 Aloqa';

export const PRODUCT_CALLBACK_PREFIX = 'product:';

/** Max products per page in product list */
export const PRODUCTS_PER_PAGE = 5;

export const PRODUCT_BUTTONS_PER_ROW = 5;

/** Pagination: list_page:0, list_page:1, ... */
export const LIST_PAGE_CALLBACK_PREFIX = 'list_page:';
export const LIST_PAGE_REGEX = /^list_page:(\d+)$/;

/** addCart:productId:quantity */
export const ADD_CART_CALLBACK_REGEX = /^addCart:(\d+):(\d+)$/;

/** qty_minus:productId:currentQty */
export const QTY_MINUS_REGEX = /^qty_minus:(\d+):(\d+)$/;
/** qty_plus:productId:currentQty */
export const QTY_PLUS_REGEX = /^qty_plus:(\d+):(\d+)$/;
/** add_to_cart:productId:qty */
export const ADD_TO_CART_REGEX = /^add_to_cart:(\d+):(\d+)$/;

export const CART_CLEAR_CALLBACK = 'cart:clear';

export const CART_CHECKOUT_CALLBACK = 'cart:checkout';

/** Cart: "➕ Davom etish" — go back to product list */
export const CART_CONTINUE_CALLBACK = 'cart_continue';

export const VIEW_CART_CALLBACK = 'view_cart';

export const BACK_LIST_CALLBACK = 'back_list';

/** Inline: back to main menu (reply keyboard) */
export const BACK_MAIN_CALLBACK = 'back_main';
