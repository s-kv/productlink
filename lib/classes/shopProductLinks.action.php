<?php

/**
 * класс для эмуляции экшена links в бэкэнде (редактирование продукта)
 */
class shopProductLinksAction extends waViewAction {
    public function execute() {
	$this->setTemplate(wa('shop')->getAppPath().'/plugins/productlink/templates/actions/backend/links.html');

        $plugin = wa()->getPlugin('productlink');
	$plugin_url = $plugin->getPluginStaticUrl();
        $product_id = (int)waRequest::get('id');

        $product_model = new shopProductModel();
	$product = $product_model->getById($product_id);
	$link_model = new shopProductlinkPluginModel();
        
        $links = array();
        $linksByProdId = array();
        $product_ids = array();
        $products = array();
                
        $links = $link_model->getByField('prod_id', $product_id, true);
        
        foreach ($links as $link) {
            $linksByProdId[$link['parent_prod_id']] = $link;
        }

        $product_ids = implode(',', array_keys($linksByProdId));

        $products = !$links ? array() : $product_model->query("
                SELECT p.id, p.url, p.name, c.full_url AS category_full_url, c.id AS category_id, c.url AS category_url
                FROM {$product_model->getTableName()} p
                LEFT JOIN shop_category c ON c.id = p.category_id
                WHERE p.id IN ($product_ids)
            ")->fetchAll('id', 1);
                
        $links2 = array();
        $linksByProdId2 = array();
        $product_ids2 = array();
        $products2 = array();
        
        $links2 = $link_model->getByField('parent_prod_id', $product_id, true);
        
        foreach ($links2 as $link) {
            $linksByProdId2[$link['prod_id']] = $link;
        }

        $product_ids2 = implode(',', array_keys($linksByProdId2));

        $products2 = !$links2 ? array() : $product_model->query("
                SELECT p.id, p.url, p.name, c.full_url AS category_full_url, c.id AS category_id, c.url AS category_url
                FROM {$product_model->getTableName()} p
                LEFT JOIN shop_category c ON c.id = p.category_id
                WHERE p.id IN ($product_ids2)
            ")->fetchAll('id', 1);        
                
        $plugin->attachFrontendUrl($products);
        $plugin->attachFrontendUrl($products2);
		
        $this->view->assign('plugin_url', $plugin_url);
        $this->view->assign('product_id', $product_id);
        $this->view->assign('product', $product);

        $this->view->assign('relations', $linksByProdId);
        $this->view->assign('products', $products);
        $this->view->assign('relations2', $linksByProdId2);
        $this->view->assign('products2', $products2);

        $this->view->assign('types', shopProductlinkPlugin::$link_types);        
    }
}
