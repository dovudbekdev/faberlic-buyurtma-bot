# Telegram Ordering Bot — UX Design (No Categories)

Clean, conversion-focused UX for a category-less product bot.  
Stack: NestJS + **grammY** (Telegram Bot API). Optional: TypeORM.

---

## 1. MAIN MENU

**Reply keyboard (one row or 2×2):**

| Button           | Label             | Action                    |
|-----------------|-------------------|---------------------------|
| 🛍 Buyurtma berish | Buyurtma berish   | Open paginated product list |
| 🛒 Savat        | Savat             | Open cart (or "Savat bo'sh") |
| 📦 Buyurtmalarim | Buyurtmalarim     | List user's orders       |
| ℹ️ Ma'lumot     | Ma'lumot          | Info / contact / help     |

**Why this structure is optimal (category-less):**

- **Single list** → No category drill-down; "Buyurtma berish" goes straight to products → fewer taps, faster ordering.
- **Savat** always visible → Reminds user to complete purchase; reduces drop-off.
- **Buyurtmalarim** → Trust (order history) and repeat orders without re-browsing.
- **Ma'lumot** → Support/FAQ/contact in one place; keeps main flow clean.

---

## 2. PRODUCT LIST FLOW (NO CATEGORIES)

**Trigger:** User taps "🛍 Buyurtma berish".

**Message (prefer `editMessageText` when coming from another inline screen):**

```
🛒 Savat: 3 ta · 150 000 so'm

1. Mahsulot A
2. Mahsulot B
3. Mahsulot C
4. Mahsulot D
5. Mahsulot E

Sahifa 1/3
```

**Rules:**

- **Paginate:** 4–5 products per page (e.g. 5).
- **Cart status line** at top: total items + total price (e.g. `🛒 Savat: 3 ta · 150 000 so'm`). If cart empty: `🛒 Savat: bo'sh` or hide line.
- **Inline keyboard:** One button per product (e.g. "1", "2", … or short name). Callback: `product:{id}`.
- **Navigation:** Row with `◀️` / `▶️` (callbacks e.g. `list_page:0`, `list_page:2`). Last row: `⬅️ Ortga qaytish` → main menu (`back_main`).

**Callback layout (pseudocode):**

```ts
// Row 1–5: product:1, product:2, ...
// Row N:   [◀️] [1/3] [▶️]
// Row N+1: [⬅️ Ortga qaytish]
```

---

## 3. PRODUCT DETAIL VIEW

**Trigger:** Callback `product:{id}`.

**Message:** Photo (if any) + caption, or text-only.

**Caption/text template:**

```
━━━━━━━━━━━━
*Mahsulot nomi*
━━━━━━━━━━━━
💰 Narxi: 50 000 so'm
📦 Omborda: 10 ta
🛒 Tanlangan: 2 ta

_Tarif_
━━━━━━━━━━━━
```

**Inline keyboard:**

| Row 1   | ➖  | 2 ta | ➕   |
|---------|-----|------|------|
| Row 2   | 🛒 Savatga qo'shish |
| Row 3   | ⬅️ Ortga qaytish     |

**Callbacks:**

- `qty_minus:{productId}:{qty}` / `qty_plus:{productId}:{qty}` → Edit same message (caption + keyboard).
- `add_to_cart:{productId}:{qty}` → Add to session cart; optional toast "Savatga qo'shildi"; keep or refresh product list.
- `back_list` → Back to product list (same page if stored).

**UX:** Prefer `editMessageCaption` / `editMessageText` instead of sending a new message.

---

## 4. CART VIEW

**Trigger:** "🛒 Savat" (or inline `view_cart`).

**Message:**

```
🛒 Savat
━━━━━━━━━━━━
• Mahsulot A: 2 × 50 000 = 100 000 so'm
• Mahsulot B: 1 × 30 000 = 30 000 so'm
━━━━━━━━━━━━
💰 Jami: 130 000 so'm
```

**Inline keyboard:**

| Row 1 | ➕ Davom etish | ❌ Tozalash | ✅ Buyurtma berish |
|-------|-----------------|-------------|---------------------|

- **➕ Davom etish** → Product list (e.g. `back_main` then show list, or direct `list_page:0`) so user can add more.
- **❌ Tozalash** → `cart:clear`; clear session cart; send "Savat tozalandi" + main menu.
- **✅ Buyurtma berish** → `cart:checkout` → Checkout flow.

If cart is empty, show: "Savat bo'sh" + single button `⬅️ Ortga qaytish` (main menu).

---

## 5. CHECKOUT FLOW

**Steps:**

1. **Phone (optional if user already has phone in DB)**  
   - Send: "📱 Telefon raqamingizni yuboring (yoki *Kontakt yuborish* tugmasini bosing)."  
   - Reply keyboard: **Request contact** button (Telegram contact request).  
   - On contact: validate phone, save/update user; go to step 2.  
   - On text: parse phone; validate; same.

2. **Order summary**  
   - One message: items (name, qty, price), total, delivery note if any.

3. **Confirm**  
   - Inline: [✅ Tasdiqlash] [❌ Bekor qilish].  
   - On confirm: create order in DB; clear cart; send "Buyurtma qabul qilindi. Tez orada bog'lanamiz." + main menu.

**Minimal messages:** One message per step (phone request → summary → confirm).

---

## 6. UX & DESIGN RULES

- **No long text blocks** — Short lines; use separators (━━━) for structure.
- **One primary action per message** — One inline keyboard = one decision.
- **Emojis** — Only where they add meaning (🛒 cart, 💰 price, 📦 stock, ✅/❌ actions).
- **Prefer edit over send** — Use `editMessageText` / `editMessageCaption` when updating the same logical screen (e.g. product qty, list page) to avoid flooding the chat.
- **Cart visible when useful** — Show cart summary (items + sum) on product list and optionally in cart/checkout headers.

---

## 7. STATE MANAGEMENT

**Suggested session shape (optional but clear):**

```ts
enum BotScreen {
  MAIN_MENU = 'main_menu',
  PRODUCT_LIST = 'product_list',
  PRODUCT_VIEW = 'product_view',
  CART = 'cart',
  CHECKOUT = 'checkout',
}

interface SessionData {
  cart: { productId: number; quantity: number }[];
  screen?: BotScreen;           // optional: last screen
  listPage?: number;            // current product list page
  checkoutStep?: 'phone' | 'summary' | 'confirm';
}
```

**Usage:** Handlers can set `ctx.session.screen = BotScreen.PRODUCT_LIST` when showing the list. Useful for "Ortga qaytish" (e.g. back to same list page) and analytics. Not strictly required if navigation is callback-driven (e.g. `list_page:0`).

**State machine (high level):**

```
MAIN_MENU ──(Buyurtma berish)──► PRODUCT_LIST ◄──(back_list)── PRODUCT_VIEW
     ▲                                  │                              │
     │                                  │ (product:id)                  │
     │                                  ▼                              │
     │                            PRODUCT_VIEW ──(add_to_cart)─────────┤
     │                                  │                              │
     │(back_main)                       │ (back_list)                  │
     │                                  ▼                              ▼
     └────────────────────────── PRODUCT_LIST ◄─────────────────────────┘

MAIN_MENU ──(Savat)──► CART ──(Davom etish)──► PRODUCT_LIST
     ▲                  │
     │                  ├──(Tozalash)──► MAIN_MENU
     │                  └──(Checkout)──► CHECKOUT ──(Confirm)──► MAIN_MENU
     └──────────────────────────────────────────────────────────────────┘
```

---

## 8. TEXT TEMPLATES & KEYBOARD LAYOUTS

### Message templates

| Screen        | Template key   | Example |
|---------------|----------------|--------|
| Product list  | `list_header`  | `🛒 Savat: 3 ta · 150 000 so'm` or `🛒 Savat: bo'sh` |
| Product list  | `list_body`    | `1. {name}\n2. {name}\n...` + `Sahifa {page}/{totalPages}` |
| Product card  | `product_caption` | Bold name, 💰 price, 📦 stock, 🛒 selected qty, italic description |
| Cart          | `cart_body`    | `🛒 Savat` + separator + lines `• {name}: {qty} × {price} = {subtotal}` + `💰 Jami: {total}` |
| Cart empty    | `cart_empty`   | `🛒 Savat bo'sh.` |
| Checkout phone| `checkout_phone` | `📱 Telefon raqamingizni yuboring yoki *Kontakt yuborish* tugmasini bosing.` |
| Order success | `order_success` | `✅ Buyurtma qabul qilindi. Tez orada siz bilan bog'lanamiz.` |

### Inline keyboard layouts

- **Product list:** `[1][2][3][4][5]` → `[◀️][1/3][▶️]` → `[⬅️ Ortga qaytish]`
- **Product detail:** `[➖][N ta][➕]` → `[🛒 Savatga qo'shish]` → `[⬅️ Ortga qaytish]`
- **Cart:** `[➕ Davom etish][❌ Tozalash][✅ Buyurtma berish]` or empty: `[⬅️ Ortga qaytish]`
- **Checkout confirm:** `[✅ Tasdiqlash][❌ Bekor qilish]`

### Code structure (NestJS + grammY)

```
src/bot/
├── bot.context.ts         # BotContext, SessionData, BotScreen enum
├── constants/             # callback prefixes, button labels
├── keyboards/             # main.keyboard, product-list.keyboard (paginated), product-detail.keyboard, cart.keyboard
├── messages/              # formatProductListWithCart(), formatCartView(), formatOrderSummary()
├── handlers/
│   ├── menu.handler.ts    # main menu replies + back_main
│   ├── product.handler.ts # product:*, list_page:*, qty_* , add_to_cart, back_list
│   ├── cart.handler.ts    # Savat, view_cart, cart:clear, cart:checkout, cart_continue
│   └── checkout.handler.ts# phone request, contact handler, summary, confirm
├── services/
│   └── cart.service.ts   # addItem, buildCartViewPayload, getCartSummary (count + total)
└── bot.service.ts        # registerHandlers(), session initial
```

### Best practices for scalability

- **Handlers** only parse input and call services; no business logic in handlers.
- **Keyboards** built by pure functions (productListKeyboard(page, products, totalPages), cartKeyboard(hasItems)).
- **Messages** from a single place (messages/*.ts) with consistent Markdown/escaping.
- **Pagination** stored in callback data (`list_page:{page}`) so no extra session field is required; optional `session.listPage` for "back to list" to same page.
- **Checkout** phone: use Telegram contact when possible; fallback to text + validation (regex/ libphonenumber).
- **Orders** list: OrderService.findByUserId(userId) with limit; show last N orders with inline "Ko'rish" if needed.

---

## Summary

- **Main menu:** 4 buttons (Buyurtma berish, Savat, Buyurtmalarim, Ma'lumot) for minimal friction and clear paths.
- **Product list:** Paginated (5 per page), cart status on top, inline product buttons + page nav + back.
- **Product detail:** Photo + caption, qty ➖/➕, Add to cart, Back; prefer edit over new message.
- **Cart:** List + total; actions: Continue ordering, Clear, Checkout.
- **Checkout:** Phone (contact or text) → Summary → Confirm; one message per step.
- **State:** Optional enum + listPage/checkoutStep in session; navigation driven by callbacks.
- **Code:** Handlers thin; keyboards and messages in separate modules; cart summary reused in list and cart.

This yields a single-list, category-less flow that feels like a real e-commerce Telegram bot and stays maintainable as the codebase grows.
