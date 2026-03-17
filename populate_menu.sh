#!/bin/bash

#############################################
# Script para Popular o Cardápio BÉNI
# Execute: bash populate_menu.sh
#############################################

# Configuração - ajuste para seu servidor
API_URL="https://benirestaurant.com"
# Para teste local: API_URL="http://localhost:8001"

echo "🍽️  Populando cardápio do BÉNI Restaurant..."

# Login e obter token
echo "Fazendo login..."
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"#Sti93qn06301616"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

if [ -z "$TOKEN" ]; then
    echo "❌ Erro ao fazer login. Verifique se o servidor está rodando."
    exit 1
fi

echo "✓ Login OK"

# Função para adicionar item
add_item() {
    curl -s -X POST "$API_URL/api/menu-items" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$1" > /dev/null
}

echo ""
echo "📝 Adicionando ENTRÉES (Pour Commencer)..."

add_item '{"category":"starters","name_fr":"Planche Mixte","name_en":"Mixed Board","name_pt":"Tábua Mista","description_fr":"Charcuterie et fromages de saison","description_en":"Charcuterie and seasonal cheeses","description_pt":"Charcutaria e queijos da estação","price":18,"sort_order":0}'

add_item '{"category":"starters","name_fr":"Carpaccio de Bœuf","name_en":"Beef Carpaccio","name_pt":"Carpaccio de Carne","description_fr":"Bœuf, roquette, tomates, câpres, Grana Padano, moutarde et sauce maison","description_en":"Beef, rocket, tomatoes, capers, Grana Padano, mustard and homemade sauce","description_pt":"Carne, rúcula, tomates, alcaparras, Grana Padano, mostarda e molho caseiro","price":18,"sort_order":1}'

add_item '{"category":"starters","name_fr":"Tartare de Bœuf","name_en":"Beef Tartare","name_pt":"Tartare de Carne","description_fr":"Bœuf, jaune d oeuf, cornichons, oignons, câpres et sauce maison","description_en":"Beef, egg yolk, pickles, onions, capers and homemade sauce","description_pt":"Carne, gema de ovo, picles, cebolas, alcaparras e molho caseiro","price":23,"sort_order":2}'

add_item '{"category":"starters","name_fr":"Dés de Tapioca","name_en":"Tapioca Bites","name_pt":"Cubos de Tapioca","description_fr":"Tapioca, fromage à pâte dure, lait, œuf, sel, poivre","description_en":"Tapioca, semi-hard cheese, milk, egg, salt, pepper","description_pt":"Tapioca, queijo de pasta dura, leite, ovo, sal, pimenta","price":13,"sort_order":3}'

add_item '{"category":"starters","name_fr":"Sphère de Parmesan à la Truffe","name_en":"Parmesan Truffle Sphere","name_pt":"Esfera de Parmesão com Trufa","description_fr":"Truffe fraîche et fromage","description_en":"Fresh truffle and cheese","description_pt":"Trufa fresca e queijo","price":16,"sort_order":4}'

add_item '{"category":"starters","name_fr":"Takoyaki (Croquette de Poulpe)","name_en":"Takoyaki (Octopus Croquette)","name_pt":"Takoyaki (Bolinho de Polvo)","description_fr":"Poulpe, pomme de terre, oignon, ail, persil, chapelure","description_en":"Octopus, potato, onion, garlic, parsley, breadcrumbs","description_pt":"Polvo, batata, cebola, alho, salsa, farinha de rosca","price":15,"sort_order":5}'

add_item '{"category":"starters","name_fr":"Velouté de Petit-Pois","name_en":"Pea Velouté","name_pt":"Velouté de Ervilhas","description_fr":"Petits pois, ail, oignon, crème et menthe","description_en":"Peas, garlic, onion, cream and mint","description_pt":"Ervilhas, alho, cebola, creme e hortelã","price":14,"sort_order":6}'

add_item '{"category":"starters","name_fr":"Carpaccio de Figue","name_en":"Fig Carpaccio","name_pt":"Carpaccio de Figo","description_fr":"Figues fraîches, burrata et noix","description_en":"Fresh figs, burrata and walnuts","description_pt":"Figos frescos, burrata e nozes","price":16,"sort_order":7}'

echo "✓ Entrées adicionadas"

echo ""
echo "🍔 Adicionando BURGERS..."

add_item '{"category":"mains","name_fr":"Béni Burger","name_en":"Béni Burger","name_pt":"Béni Burger","description_fr":"Steak de bœuf maison, bacon, sauce cheddar, laitue, tomate, oignons. Servi avec frites","description_en":"Homemade beef patty, bacon, cheddar sauce, lettuce, tomato, onions. Served with fries","description_pt":"Hambúrguer caseiro, bacon, molho cheddar, alface, tomate, cebola. Servido com batatas fritas","price":22,"sort_order":8}'

add_item '{"category":"mains","name_fr":"Chicken Burger","name_en":"Chicken Burger","name_pt":"Chicken Burger","description_fr":"Poulet, laitue, tomate, sauce moutarde au miel. Servi avec frites","description_en":"Chicken, lettuce, tomato, honey mustard sauce. Served with fries","description_pt":"Frango, alface, tomate, molho de mostarda com mel. Servido com batatas fritas","price":21,"sort_order":9}'

add_item '{"category":"mains","name_fr":"Truffé Burger","name_en":"Truffle Burger","name_pt":"Truffé Burger","description_fr":"Steak de bœuf maison, mayonnaise à la truffe, champignons sautés, parmesan, laitue. Servi avec frites","description_en":"Homemade beef patty, truffle mayonnaise, sautéed mushrooms, parmesan, lettuce. Served with fries","description_pt":"Hambúrguer caseiro, maionese de trufa, cogumelos salteados, parmesão, alface. Servido com batatas fritas","price":23,"sort_order":10}'

echo "✓ Burgers adicionados"

echo ""
echo "🍝 Adicionando PASTA ET RIZ..."

add_item '{"category":"mains","name_fr":"Riso al Salto","name_en":"Riso al Salto","name_pt":"Riso al Salto","description_fr":"Riz à risotto, parmesan, mozzarella, beurre, pesto","description_en":"Risotto rice, parmesan, mozzarella, butter, pesto","description_pt":"Arroz de risoto, parmesão, mozzarella, manteiga, pesto","price":20,"sort_order":11}'

add_item '{"category":"mains","name_fr":"Spaghetti à la Carbonara","name_en":"Spaghetti Carbonara","name_pt":"Spaghetti à Carbonara","description_fr":"Spaghetti, jaune d oeuf, guanciale, parmesan, poivre noir","description_en":"Spaghetti, egg yolk, guanciale, parmesan, black pepper","description_pt":"Spaghetti, gema de ovo, guanciale, parmesão, pimenta preta","price":18,"sort_order":12}'

add_item '{"category":"mains","name_fr":"Risotto alla Norma","name_en":"Risotto alla Norma","name_pt":"Risotto alla Norma","description_fr":"Riz à risotto, tomate, aubergine, mozzarella, parmesan, basilic","description_en":"Risotto rice, tomato, eggplant, mozzarella, parmesan, basil","description_pt":"Arroz de risoto, tomate, berinjela, mozzarella, parmesão, manjericão","price":19,"sort_order":13}'

add_item '{"category":"mains","name_fr":"Linguine au Pesto de Pistaches","name_en":"Linguine with Pistachio Pesto","name_pt":"Linguine ao Pesto de Pistache","description_fr":"Linguine, pesto de pistaches, stracciatella, éclats de pistaches","description_en":"Linguine, pistachio pesto, stracciatella, pistachio crumble","description_pt":"Linguine, pesto de pistache, stracciatella, pistache picado","price":21,"sort_order":14}'

add_item '{"category":"mains","name_fr":"Ravioli Champignons et Truffe","name_en":"Mushroom and Truffle Ravioli","name_pt":"Ravioli de Cogumelos e Trufa","description_fr":"Pâtes fraîches, champignons, crème de truffe, truffe fraîche, parmesan","description_en":"Fresh pasta, mushrooms, truffle cream, fresh truffle, parmesan","description_pt":"Massa fresca, cogumelos, creme de trufa, trufa fresca, parmesão","price":25,"sort_order":15}'

add_item '{"category":"mains","name_fr":"Papardelle Fraîches Farcies","name_en":"Stuffed Fresh Pappardelle","name_pt":"Papardelle Recheado","description_fr":"Pappardelle farcies au ragout de bœuf mijoté, parmesan, herbes","description_en":"Pappardelle stuffed with slow-cooked beef ragout, parmesan, herbs","description_pt":"Papardelle recheado com ragu de carne cozido lentamente, parmesão, ervas","price":23,"sort_order":16}'

add_item '{"category":"mains","name_fr":"Ravioloni Scampi","name_en":"Scampi Ravioloni","name_pt":"Ravioloni de Camarão","description_fr":"Ravioloni maison aux crevettes, épinards, ricotta, parmesan, bisque de crevettes","description_en":"Homemade ravioloni with shrimp, spinach, ricotta, parmesan, shrimp bisque","description_pt":"Ravioloni caseiro com camarão, espinafre, ricota, parmesão, bisque de camarão","price":23,"sort_order":17}'

add_item '{"category":"mains","name_fr":"Riz Mijoté aux Côtes de Porc","name_en":"Braised Rice with Pork Ribs","name_pt":"Arroz de Costela de Porco","description_fr":"Riz braisé avec côtes de porc, ail, oignons, herbes, sauce de cuisson","description_en":"Braised rice with pork ribs, garlic, onions, herbs, cooking sauce","description_pt":"Arroz braseado com costela de porco, alho, cebola, ervas, molho de cozimento","price":22,"sort_order":18}'

echo "✓ Pasta et Riz adicionados"

echo ""
echo "🥩 Adicionando TERRE & MER..."

add_item '{"category":"seafood","name_fr":"Saumon en Croûte d Herbes","name_en":"Herb-Crusted Salmon","name_pt":"Salmão em Crosta de Ervas","description_fr":"Saumon en croûte d herbes, légumes frais sautés, sauce piri-piri","description_en":"Salmon in herb crust, sautéed fresh vegetables, piri-piri sauce","description_pt":"Salmão em crosta de ervas, legumes frescos salteados, molho piri-piri","price":31,"sort_order":0}'

add_item '{"category":"mains","name_fr":"Picanha Grillée","name_en":"Grilled Picanha","name_pt":"Picanha Grelhada","description_fr":"Picanha grillée, pomme de terre au four, fromage frais, cassave grillée, bacon, vinaigrette","description_en":"Grilled picanha, baked potato, cream cheese, toasted cassava, bacon, vinaigrette","description_pt":"Picanha grelhada, batata assada, cream cheese, mandioca tostada, bacon, vinagrete","price":30,"sort_order":19}'

add_item '{"category":"seafood","name_fr":"Poke Bowl Thon Tataki","name_en":"Tuna Tataki Poke Bowl","name_pt":"Poke Bowl de Atum Tataki","description_fr":"Riz basmati, thon tataki, sésame, wakame, edamame, gingembre, germes de soja","description_en":"Basmati rice, tuna tataki, sesame, wakame, edamame, ginger, soy sprout","description_pt":"Arroz basmati, atum tataki, gergelim, wakame, edamame, gengibre, broto de soja","price":32,"sort_order":1}'

add_item '{"category":"mains","name_fr":"Entrecôte d Or","name_en":"Golden Ribeye","name_pt":"Entrecôte de Ouro","description_fr":"Entrecôte de bœuf, roquette, tomate, parmesan, pommes de terre écrasées. Choix de sauces: Poivre, Champignon, Fromage","description_en":"Beef ribeye, rocket, tomato, parmesan, crushed potatoes. Choice of sauces: Pepper, Mushroom, Cheese","description_pt":"Entrecôte de boi, rúcula, tomate, parmesão, batatas esmagadas. Escolha de molhos: Pimenta, Cogumelo, Queijo","price":35,"sort_order":20}'

echo "✓ Terre & Mer adicionados"

echo ""
echo "🧒 Adicionando MENU ENFANT..."

add_item '{"category":"mains","name_fr":"Mini Béni - Poulet Croustillant","name_en":"Mini Béni - Crispy Chicken","name_pt":"Mini Béni - Frango Crocante","description_fr":"Poulet croustillant avec frites","description_en":"Crispy chicken with fries","description_pt":"Frango crocante com batatas fritas","price":11,"sort_order":21}'

add_item '{"category":"mains","name_fr":"Mini Béni - Pâtes à la Tomate","name_en":"Mini Béni - Tomato Pasta","name_pt":"Mini Béni - Massa ao Tomate","description_fr":"Pâtes à la sauce tomate","description_en":"Pasta with tomato sauce","description_pt":"Massa com molho de tomate","price":11,"sort_order":22}'

echo "✓ Menu Enfant adicionado"

echo ""
echo "🍰 Adicionando DESSERTS..."

add_item '{"category":"desserts","name_fr":"Tartelette Exotique","name_en":"Exotic Tartlet","name_pt":"Tartelete Exótica","description_fr":"Crème pâtissière, fruit de la passion, mangue, crumble","description_en":"Pastry cream, passion fruit, mango, crumble","description_pt":"Creme de confeiteiro, maracujá, manga, crumble","price":13,"sort_order":0}'

add_item '{"category":"desserts","name_fr":"Moelleux au Dulce de Leche","name_en":"Dulce de Leche Moelleux","name_pt":"Moelleux de Doce de Leite","description_fr":"Moelleux au dulce de leche, glace au yaourt, crumble","description_en":"Dulce de leche moelleux, yoghurt ice cream, crumble","description_pt":"Moelleux de doce de leite, sorvete de iogurte, crumble","price":12,"sort_order":1}'

add_item '{"category":"desserts","name_fr":"Dame Blanche","name_en":"Dame Blanche","name_pt":"Dame Blanche","description_fr":"Glace vanille, sauce chocolat chaud, chantilly, génoise vanille","description_en":"Vanilla ice cream, hot chocolate sauce, whipped cream, vanilla sponge cake","description_pt":"Sorvete de baunilha, calda de chocolate quente, chantilly, pão de ló de baunilha","price":12,"sort_order":2}'

add_item '{"category":"desserts","name_fr":"L Arbre Enchanté","name_en":"The Enchanted Tree","name_pt":"A Árvore Encantada","description_fr":"Barbe à papa fraise, tronc en chocolat, sorbet fraise","description_en":"Strawberry cotton candy, chocolate trunk, strawberry sorbet","description_pt":"Algodão doce de morango, tronco de chocolate, sorbet de morango","price":13,"sort_order":3}'

add_item '{"category":"desserts","name_fr":"La Forêt de Béni","name_en":"Béni Forest","name_pt":"A Floresta do Béni","description_fr":"Mousse au chocolat, biscuit noisette","description_en":"Chocolate mousse, hazelnut biscuit","description_pt":"Mousse de chocolate, biscoito de avelã","price":13,"sort_order":4}'

add_item '{"category":"desserts","name_fr":"Café Gourmand","name_en":"Gourmet Coffee","name_pt":"Café Gourmand","description_fr":"Assortiment de mignardises","description_en":"Assorted mignardises","description_pt":"Sortido de mignardises","price":12,"sort_order":5}'

echo "✓ Desserts adicionados"

echo ""
echo "🍷 Adicionando BOISSONS..."

add_item '{"category":"drinks","name_fr":"Eau Minérale","name_en":"Mineral Water","name_pt":"Água Mineral","description_fr":"Plate ou gazeuse, 75cl","description_en":"Still or sparkling, 75cl","description_pt":"Com ou sem gás, 75cl","price":5,"sort_order":0}'

add_item '{"category":"drinks","name_fr":"Café Espresso","name_en":"Espresso","name_pt":"Café Espresso","description_fr":"Café italien","description_en":"Italian coffee","description_pt":"Café italiano","price":3,"sort_order":1}'

add_item '{"category":"drinks","name_fr":"Thé / Infusion","name_en":"Tea / Infusion","name_pt":"Chá / Infusão","description_fr":"Sélection de thés et infusions","description_en":"Selection of teas and infusions","description_pt":"Seleção de chás e infusões","price":4,"sort_order":2}'

add_item '{"category":"drinks","name_fr":"Jus de Fruits Frais","name_en":"Fresh Fruit Juice","name_pt":"Suco de Frutas Frescas","description_fr":"Orange, pomme ou ananas","description_en":"Orange, apple or pineapple","description_pt":"Laranja, maçã ou abacaxi","price":6,"sort_order":3}'

add_item '{"category":"drinks","name_fr":"Soft Drinks","name_en":"Soft Drinks","name_pt":"Refrigerantes","description_fr":"Coca-Cola, Sprite, Fanta","description_en":"Coca-Cola, Sprite, Fanta","description_pt":"Coca-Cola, Sprite, Fanta","price":4,"sort_order":4}'

echo "✓ Boissons adicionadas"

echo ""
echo "=============================================="
echo "✅ CARDÁPIO POPULADO COM SUCESSO!"
echo "=============================================="
echo ""
echo "Total de itens adicionados:"
echo "  - Entrées: 8"
echo "  - Burgers: 3"
echo "  - Pasta et Riz: 8"
echo "  - Terre & Mer: 4"
echo "  - Menu Enfant: 2"
echo "  - Desserts: 6"
echo "  - Boissons: 5"
echo "  ─────────────────"
echo "  TOTAL: 36 pratos"
echo ""
echo "🌐 Acesse: https://benirestaurant.com/menu"
