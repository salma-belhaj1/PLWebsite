import re
from collections import Counter, defaultdict

text = '''Notebooks Image Type Couleur Pages État Prix initial Prix de vente Bénéfice Client Téléphone Date commande Date livraison HOPE Book C Recto Rose 80 Vendu 6 0 -6 max-maklouba 01/11/2025 01/11/2025 52 Pad C Recto Noir 50 En stock 4 8 4 03/11/2025 03/11/2025 Book P Recto Bleu 80 Vendu 6 0 -6 01/11/2025 01/11/2025 Pad P Recto Blanc 50 En stock 4 6 2 Book C Recto Bleu 80 En stock 10 18 8 Konch Rose 96 En stock 4 5 1 Konch Beige 96 En stock 4 5 1 Konch Blanc 96 En stock 4 5 1 Konch Vert 96 En stock 4 5 1 Hair Image Catégorie Couleur État Prix initial Prix de vente Bénéfice Client Téléphone Date commande Date livraison HOPE clip Orangé Vendu 0,75 0 -0,75 01/11/2025 01/11/2025 71 clip Orangé En stock 0,75 2 1,25 clip Orangé En stock 0,75 2 1,25 clip Orangé En stock 0,75 2 1,25 clip Jaune En stock 0,75 2 1,25 clip Jaune En stock 0,75 2 1,25 clip Jaune En stock 0,75 2 1,25 clip Blanc En stock 0,75 2 1,25 clip Blanc En stock 0,75 2 1,25 clip Blanc En stock 0,75 2 1,25 clip Blanc En stock 0,75 2 1,25 clip Rose En stock 5 5 0 clip Noir En stock 2,5 5 2,5 clip Rouge En stock 2,5 5 2,5 headband Bleu En stock 0,75 3 2,25 headband Jaune En stock 0,75 3 2,25 headband Rose En stock 0,75 3 2,25 headband Beige En stock 0,75 3 2,25 headband Noir En stock 0,75 3 2,25 headband Bleu En stock 0,75 3 2,25 headband Bleu En stock 0,75 3 2,25 headband Bleu En stock 0,75 3 2,25 headband Bleu En stock 0,75 3 2,25 headband Bleu En stock 0,75 3 2,25 Face Image Catégorie Couleur État Prix initial Prix de vente Bénéfice Client Téléphone Date commande Date livraison HOPE mascara Vert En stock 16 18 2 159 mascara Vert En stock 16 18 2 mascara Rose En stock 16 18 2 brush Rouge En stock 5 9 4 brush Rose En stock 5 9 4 lip gloss Rose En stock 9 10 1 beauty blender Rose En stock 5,5 6 0,5 beauty blender Jaune En stock 5,5 6 0,5 beauty blender Rose En stock 2 6 4 beauty blender Mauve En stock 2 6 4 eyebrow pencil Noir En stock 3 7 4 eyebrow pencil Marron En stock 3 7 4 eyebrow pencil Beige En stock 3 7 4 mask tool Rose En stock 1 4 3 mask tool Rose En stock 1 4 3 mask tool Rose En stock 1 4 3 strass Blanc Vendu 1,3 2 0,7 28/10/2025 28/10/2025 strass Blanc Vendu 1,3 2 0,7 28/10/2025 28/10/2025 strass Blanc Vendu 1,3 2 0,7 28/10/2025 28/10/2025 strass Blanc Vendu 1,3 2 0,7 28/10/2025 28/10/2025 strass Blanc Vendu 1,3 2 0,7 28/10/2025 28/10/2025 strass Blanc Vendu 1,3 2 0,7 28/10/2025 28/10/2025 mask yara Rose En stock 2 4 2 mask yara Rose En stock 2 4 2 HandAcc Image Catégorie Couleur État Prix initial Prix de vente Bénéfice Client Téléphone Date commande Date livraison HOPE Bracelet Blanc En stock 5 8 3 8 SatinPack Image Couleur État Prix initial Prix de vente Bénéfice Client Téléphone Date commande Date livraison HOPE Noir En stock 6,1 42 35,9 203 Marron Vendu 6,1 40 33,9 Chayma 27/02/2026 27/02/2026 Gris En stock 6,1 42 35,9 Rose Vendu 6,1 40 33,9 Karbia 28/10/2025 28/10/2025 Mauve Vendu 6,1 0 -6,1 BD Gift MauveRosé Vendu 6,1 27 20,9 Maha 18/02/2026 18/02/2026 Chouchou Gris En stock 0 6 6 Chouchou Gris En stock 0 6 6 Gifts Image Catégorie Couleur État Prix initial Prix de vente Bénéfice Client Téléphone Date commande Date livraison HOPE Plushie Rose En stock 3 10 7 40 Plushie Blanc En stock 3 10 7 40 Plushie Orangé En stock 3 10 7 40 Keychain Bleu Vendu 2 0 -2 Gift Aya 40 Keychain Rose En stock 2 5 3 40 Socks Noir En stock 1,5 5 3,5 40 OtherExp Image Catégorie État Prix Total Packaging L En stock 1 43 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging L En stock 1,16 Packaging + sticker Vendu 3,66 10 Packaging + sticker Vendu 3,66 Packaging + sticker En stock 3,66 Packaging + sticker En stock 3,66 Packaging S Vendu 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 Packaging S En stock 0,76 TY Card Vendu 0,3 15 TY Card Vendu 0,3 TY Card Vendu 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 TY Card En stock 0,3 Stickers Vendu 0,7 35 Stickers Vendu 0,7 Stickers Vendu 0,7 Stickers Vendu 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Stickers En stock 0,7 Pack...'''

CATEGORY_NAMES = ['Notebooks', 'Hair', 'Face', 'HandAcc', 'SatinPack', 'Gifts', 'OtherExp']

# split into category sections
parts = re.split(r'(?<=\b)(' + '|'.join(CATEGORY_NAMES) + r')(?=\s)', text)
sections = {parts[i]: parts[i+1].strip() for i in range(1, len(parts), 2)}

# helper to parse currency with comma
def parse_num(token):
    return float(token.replace(',', '.'))


def parse_rows(tokens, headers):
    rows=[]
    i=0
    while i < len(tokens):
        # row start is product name token until we hit status token (En stock or Vendu)
        if tokens[i] in ['Image','HOPE']:
            i += 1
            continue
        # find next status
        j=i
        while j < len(tokens) and tokens[j] not in ['Vendu','En','En_stock','En stock']:
            j += 1
        if j >= len(tokens):
            break
        status = tokens[j]
        if status == 'En':
            # maybe 'En stock' split
            if j+1 < len(tokens) and tokens[j+1] == 'stock':
                status = 'En stock'
                j += 1
        row = tokens[i:j+1]
        # now capture numbers after status until we hit next capitalized word that is not numeric? For many rows, row includes numbers after status
        k=j+1
        # gather up to next product start heuristics: next word capitalized and not currency nor numbers maybe? But can be Composed names with uppercase
        while k < len(tokens):
            if tokens[k] in CATEGORY_NAMES:
                break
            # if next token looks like a product start and previous token count enough to include at least 4 numbers
            if tokens[k] not in ['Vendu','stock'] and re.match(r'^[A-Z][a-zA-Z0-9_éèàçôûâäöüőűëÉÁ].*$', tokens[k]) and len(row) >= 5:
                # might be next row start if token isn't a measure or client name? Hard to know.
                # We'll use a crude approach: if current row already has a numeric price after status and the token is capitalized but not a number, treat as next row.
                # But some product names begin with lowercase e.g. 'lip' or 'headband' no capital.
                pass
            # We'll stop if we've seen 4 numeric tokens after status and next token doesn't look like a date or name? not robust.
            if len(row) > 0 and len([t for t in row if re.match(r'^[-\d,.]+$', t)]) >= 4 and tokens[k][0].isalpha() and tokens[k][0].islower():
                break
            row.append(tokens[k])
            k += 1
        rows.append(row)
        i = k
    return rows


rows_by_category = {}
for cat, body in sections.items():
    tokens = body.replace('En stock', 'En stock').split()
    rows = []
    i=0
    while i < len(tokens):
        if tokens[i] in ['Image','HOPE']:
            i += 1
            continue
        # detect row start by status after some tokens
        # we need find a status token after token i
        status_idx = None
        for j in range(i, min(i+12, len(tokens))):
            if tokens[j] == 'Vendu' or (tokens[j] == 'En' and j+1 < len(tokens) and tokens[j+1] == 'stock'):
                status_idx = j
                break
        if status_idx is None:
            break
        j = status_idx
        status = 'Vendu' if tokens[j] == 'Vendu' else 'En stock'
        if tokens[j]=='En':
            j +=1
        # Now capture row from i to some end after status. We know after status comes price initial, price sale, profit
        # Let's extract next 3 numbers if possible, then any remaining date or client fields.
        row = tokens[i:j+1]
        col_idx = j+1
        while col_idx < len(tokens) and len(row) < 12:
            row.append(tokens[col_idx])
            col_idx += 1
            # break if next row likely begins: capitalized product or category and we've already enough numeric fields
            if len(row) >= 8 and tokens[col_idx-1] not in ['ET', 'De']:
                # maybe end of row when we've seen status and 3 numeric values and next token is capitalized and not a date
                pass
        rows.append(row)
        i = col_idx
    rows_by_category[cat]=rows

for cat, rows in rows_by_category.items():
    print('###', cat, len(rows), 'rows')
    for r in rows[:10]:
        print(r)
    print('---')

# Use a more deterministic approach by pattern matching product name and tokens using status
print('\n=== Better parse using status + following numeric tokens ===')
for cat, body in sections.items():
    tokens = body.replace('En stock', 'En stock').split()
    rows=[]
    i=0
    while i < len(tokens):
        if tokens[i] in ['Image','HOPE']:
            i += 1
            continue
        # find status token after i
        status_pos=None
        for j in range(i+1, len(tokens)):
            if tokens[j]=='Vendu' or (tokens[j]=='En' and j+1 < len(tokens) and tokens[j+1]=='stock'):
                status_pos=j
                break
        if status_pos is None:
            break
        # row starts at i, ends after status plus numeric values
        end=status_pos+1
        if tokens[status_pos]=='En':
            end += 1
        # include up to 4 tokens after status or until next uppercase word that seems like new row start and enough numeric fields
        numeric_after=0
        while end < len(tokens) and numeric_after < 4:
            if re.match(r'^[-\d,.]+$', tokens[end]):
                numeric_after+=1
            end+=1
        rows.append(tokens[i:end])
        i=end
    print('cat', cat, 'rows', len(rows))
    for r in rows[:10]:
        print(r)
    print('---')
"