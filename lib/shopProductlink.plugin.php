<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class shopProductlinkPlugin extends shopPlugin
{
    var $routing = null;
    var $route = null;
    var $url_type = 0;
    
    static $link_types = array(
                    'basic' => 'базовый',
                    'add' => 'дополнительный',
    );    
    
    public function __construct($params)
    {
        $this->routing = wa()->getRouting();
        $domain_routes = $this->routing->getByApp('shop');
        // берём по возможности не скрытое поселение с меньшим типом ссылок (наиболее желательно смешанный, наименее - естественный т.к. там самая не строгая уникальность)
        foreach ($domain_routes as $d => $routes)foreach ($routes as $route)
            if(is_null($this->route) 
                || isset($this->route['private']) && !isset($route['private'])
                || !isset($this->route['private']) && !isset($route['private']) && $route['url_type'] < @$this->route['url_type']
            ){
                $this->route = $route;
                $this->route['domain'] = $d;
            }
        if($this->route){
            $this->url_type = $this->route['url_type'];
        }
        parent::__construct($params);
    }
    
    public function attachFrontendUrl(&$products) // url, category_full_url, category_id, category_url, 
    {
        if(!$products) 
            return;
        $single = isset($products['id']);
        if($single) 
            $products = array($products);
        $domain = $this->routing->getDomain();
        $route = $this->routing->getRoute();
        $this->routing->setRoute($this->route, $this->route['domain']);
        if($this->route){
            foreach($products as &$product){
                $params = array('product_url' => $product['url']);
                if ($product['category_id']) 
                    $params['category_url'] = $this->url_type == 1 ? $product['category_url'] : $product['category_full_url'];
                $product['frontend_url'] = $this->routing->getUrl('/frontend/product', $params, true);
            }
            unset($product);
        }        
        $this->routing->setRoute($route, $domain);
        if($single) $products = $products[0];
    }
        
    public function backend_product($product)
    {
        $product_id = $product['data']['id'];
        $plugin_url = wa()->getPlugin('product')->getPluginStaticUrl();
        $edit_section_li = !$product_id || $product_id == 'new' ? '' : <<<HTML
        <li class='links'>
                <a href='?action=products#/product/$product_id/edit/links/'>
                        Взаимосвязи
                        <span class="s-product-edit-tab-status"></span>
                </a>
        </li>
HTML;
	return array('edit_section_li' => $edit_section_li);
    }
}