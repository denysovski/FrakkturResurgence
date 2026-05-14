# FrakkturResurgence - databázová dokumentace

Tento soubor popisuje, jak je v projektu řešená databáze, kde jsou uložené přihlašovací údaje, jak funguje připojení, jak vypadá schéma a jak je databáze zabezpečená.

## 1. Jak databáze funguje

Projekt používá MySQL databázi pro persistentní data. Backend je řešený přes PHP endpointy a frontend komunikuje s API přes HTTP požadavky.

Tok dat je zjednodušeně tento:

1. Frontend pošle požadavek na backend.
2. PHP endpoint v `public/auth.php` požadavek zpracuje.
3. Připojení k databázi zajistí `public/lib/db.php`.
4. `db.php` vytvoří PDO připojení a backend pak čte nebo zapisuje data.
5. Data se ukládají do MySQL tabulek jako uživatelé, produkty, košík, objednávky a wishlist.

## 2. Kde je uložené připojení k databázi

V projektu jsou pro databázi důležité hlavně tyto soubory:

- `public/lib/db.php` - centrální helper, který vytváří PDO připojení.
- `public/config.php` - lokální konfigurace pro host, port, název databáze, uživatele a heslo.
- `.env.example` - ukázka frontendových proměnných.
- `.env.production.example` - ukázka produkčních proměnných.
- `public/auth.php` - hlavní backend endpoint pro auth, cart, wishlist a objednávky.
- `sql/FULL_IMPORT_ENDORA_SHARED.sql` - kompletní SQL import pro phpMyAdmin.
- `ppdatabase_orders_migration.sql` - migrační SQL jen pro tabulky objednávek.

### Jak `db.php` funguje

Soubor `public/lib/db.php` nejdřív zkusí načíst `public/config.php`. Potom hledá hodnoty i v proměnných prostředí:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Pokud některá z hodnot chybí, připojení se nevytvoří.

PDO je nastavené takto:

- `utf8mb4` jako charset
- `PDO::ERRMODE_EXCEPTION`
- `PDO::ATTR_DEFAULT_FETCH_MODE = PDO::FETCH_ASSOC`
- vypnuté emulované prepared statements

## 3. Kde jsou uložené soukromé údaje

Citlivé údaje jsou uložené mimo frontendový kód.

Typicky jde o:

- databázové přihlašovací údaje v `public/config.php`
- lokální nebo produkční hodnoty v `.env` souborech
- případně hodnoty předané z hostingu jako environment variables

Důležité je, že frontendové soubory v `src/` nemají obsahovat hesla ani DB credentials.

### Co je citlivé

- DB host
- DB jméno
- DB uživatel
- DB heslo
- session a cookie data
- hash hesla uživatele v tabulce `users`

## 4. K čemu je `.gitignore`

Soubor `.gitignore` říká GitHubu a Gitu, které soubory se nemají verzovat.

V tomto projektu je důležité hlavně to, že `.gitignore` ignoruje:

- `node_modules`
- `dist`
- `.env`
- `.env.*`
- `public/config.php`

To znamená, že lokální produkční konfigurace a přístupy k databázi nemají být běžně commitované do repozitáře.

## 5. Jak je databáze zabezpečená

Bezpečnost je řešená několika vrstvami:

### a) Hesla nejsou ukládaná jako plaintext

Tabulka `users` ukládá heslo do sloupce `password_hash`, ne jako otevřený text. To znamená, že hesla mají být hashovaná.

### b) PDO a prepared statements

Backend používá PDO a připravené dotazy. To pomáhá proti SQL injection.

### c) Session cookies

V `public/auth.php` se session cookie nastavuje s vlastnostmi:

- `httponly = true`
- `samesite = Lax`
- `secure = true` na HTTPS
- omezená životnost cookie

### d) Cizí klíče a referenční integrita

Databáze má foreign keys mezi tabulkami. To hlídá konzistenci dat a zabraňuje osamoceným záznamům.

Používá se i:

- `ON DELETE CASCADE`
- `ON DELETE SET NULL`

### e) Citlivá konfigurace mimo frontend

DB nastavení není v React části aplikace. Backend si hodnoty bere z PHP konfigurace nebo z environment proměnných.

### f) Guest vs user objednávky

Objednávky mají dva režimy:

- přihlášený uživatel -> vyplňuje se `user_id`
- ne-přihlášený uživatel -> vyplňuje se `guest_label`

To je důležité pro rozlišení hostů a registrovaných zákazníků.

## 6. Jak databáze vypadá

Databáze je relační a je postavená kolem katalogu produktů, košíku, objednávek a účtů.

Hlavní entita je `products`, ke které se vážou další tabulky.

Zjednodušený vztah:

- `categories` 1:N `products`
- `products` 1:N `product_sizes`
- `users` 1:N `cart_items`
- `users` 1:N `wishlist_items`
- `users` 1:N `orders`
- `orders` 1:N `order_items`

## 7. Přehled tabulek

### `users`

Ukládá registrované uživatele.

Sloupce:

- `id`
- `email`
- `full_name`
- `password_hash`
- `status`
- `created_at`
- `updated_at`

### `categories`

Seznam kategorií katalogu.

Sloupce:

- `id`
- `slug`
- `title`
- `created_at`

### `products`

Hlavní katalog produktů.

Sloupce:

- `id`
- `category_id`
- `product_code`
- `name`
- `description`
- `stock_total`
- `price_cents`
- `material`
- `sustainability`
- `image_key`
- `has_sizes`
- `is_active`
- `created_at`
- `updated_at`

### `product_sizes`

Varianty velikostí a sklad.

Sloupce:

- `id`
- `product_id`
- `size_code`
- `stock`
- `created_at`

### `tshirts`, `hoodies`, `caps`, `belts`, `pants`, `knitwear`, `leather_jackets`

Kategorie-specifické tabulky pro seed/import data.

Obsahují vždy informace o produktu pro danou kategorii, například:

- `name`
- `description`
- `stock`
- `available_sizes_json`
- `price_cents`
- `material`
- `sustainability`
- `image_key`

### `cart_items`

Košík přihlášeného uživatele.

- navázaný přes `user_id`
- ukládá `product_id`, `size_code`, `quantity`
- unikát je na kombinaci uživatel + produkt + velikost

### `wishlist_items`

Wishlist přihlášeného uživatele.

- navázaný přes `user_id`
- ukládá `product_id`
- unikát je na kombinaci uživatel + produkt

### `orders`

Hlavička objednávky.

Sloupce obsahují:

- `order_number`
- `user_id`
- `guest_label`
- doručovací údaje
- `payment_method`
- `currency`
- `subtotal_cents`
- `shipping_cents`
- `total_cents`
- `status`
- `created_at`
- `updated_at`

Důležité:

- `user_id` je `NULL` pro hosta
- `guest_label` je vyplněný pro hosty
- při smazání uživatele se `user_id` v objednávce nastaví na `NULL`

### `order_items`

Položky objednávky.

Obsahují snapshot dat v době vytvoření objednávky:

- `order_id`
- `product_id`
- `product_code`
- `category_key`
- `category_title`
- `product_name`
- `image_key`
- `size_code`
- `unit_price_cents`
- `quantity`
- `line_total_cents`

To je důležité proto, že objednávka si zachová historii i když se produkt později změní.

## 8. Import a migrace databáze

Pro nasazení existují dva hlavní SQL soubory:

- `sql/FULL_IMPORT_ENDORA_SHARED.sql` - kompletní import celé databáze pro Endoru
- `ppdatabase_orders_migration.sql` - rychlá migrace jen pro objednávky

### Co dělá full import

- vytvoří tabulky
- nastaví relace
- vloží výchozí kategorie
- obsahuje seed produktů

### Co dělá orders migrace

- přidá tabulku `orders`
- přidá tabulku `order_items`
- je vhodná, když už databáze existuje a potřebuješ jen doplnit objednávky

## 9. Jaké soubory jsou nejdůležitější pro databázi

### Backend

- `public/auth.php`
- `public/lib/db.php`
- `public/config.php`

### SQL

- `sql/FULL_IMPORT_ENDORA_SHARED.sql`
- `ppdatabase_orders_migration.sql`

### Frontend napojení na API

- `src/lib/cart.ts`
- `src/lib/orders.ts`
- `src/lib/wishlist.ts`
- `src/lib/productsApi.ts`
- `src/lib/auth.ts`

## 10. Poznámka k bezpečnosti produkce

Pokud budeš projekt dál rozvíjet, doporučuje se:

- držet DB credentials mimo webroot
- neponechávat debug režim zapnutý v produkci
- nepřidávat secret hodnoty do frontend buildů
- používat silná hesla a omezené DB účty
- pravidelně kontrolovat, že `public/config.php` není veřejně přístupný přes web

## 11. Shrnutí

Databáze FrakkturResurgence je MySQL databáze napojená přes PHP backend s PDO. Obsahuje uživatele, produkty, velikosti, wishlist, košík a objednávky. Soukromé údaje patří do `public/config.php` nebo do environment proměnných a nemají být součástí frontendového kódu. `.gitignore` chrání lokální konfiguraci a build artefakty před verzováním.
