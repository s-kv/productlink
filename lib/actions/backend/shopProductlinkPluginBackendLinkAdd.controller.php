<?php

class shopProductlinkPluginBackendLinkAddController extends waJsonController
{
    public function hasCircleLinks($product_id, $relative_product_id, $is_revert)
    {
        $link_model = new shopProductlinkPluginModel();
        
        if(!$is_revert) {
            $links = $link_model->getByField('prod_id', $relative_product_id, true);
        } else {
            $links = $link_model->getByField('parent_prod_id', $relative_product_id, true);
        }

        if(empty($links)){
            return false;
        } else {
            foreach ($links as $link) {
                if(!$is_revert)
                    $compare_id = $link['parent_prod_id'];
                else
                    $compare_id = $link['prod_id'];
                
                if($compare_id == $product_id){
                    return true;
                } else {
                    if($this->hasCircleLinks($product_id, $compare_id, $is_revert)){
                        return true;
                    }
                }
            }
        }        
    }
    
    public function execute()
    {
        $product_id = waRequest::get('product_id', 0, waRequest::TYPE_INT);
        $relative_product_id = waRequest::get('relative_product_id', 0, waRequest::TYPE_INT);
        $is_revert = (bool)waRequest::get('is_revert', 0, waRequest::TYPE_INT);
        //$sort = waRequest::get('sort', 0, waRequest::TYPE_INT);

        if(!$product_id || !$relative_product_id){
            $this->response = array('product' => null, 'errors' => 'Не хватает данных для создания записи.');
            return;
        }

        $plugin_id = waRequest::get('plugin', null);
        $plugin = wa()->getPlugin($plugin_id, true);
        $product_model = new shopProductModel();
        $relative_product = $product_model->getById($relative_product_id);
        //$product = $product_model->getById($product_id);
        $link_model = new shopProductlinkPluginModel();
        $errors = array();
        
        if($product_id == $relative_product_id){
            $errors[] = 'Нельзя добавлять ссылку на самого себя!';
        } elseif($this->hasCircleLinks($product_id, $relative_product_id, $is_revert)){
            $errors[] = 'Обнаружена транзитивная ссылка продукта на самого себя!';
        } else {
            // запоминаем соответствие
            if(!$is_revert) {
                $link['prod_id'] = $product_id;
                $link['parent_prod_id'] = $relative_product_id;
                //$link['type'] = 'basic';
            } else {
                $link['prod_id'] = $relative_product_id;
                $link['parent_prod_id'] = $product_id;
                //$link['type'] = 'basic';
            }

            $link_model->insert($link);            
        }
        $errors = implode('<br>', $errors);
	$plugin->attachFrontendUrl($relative_product);
        $this->response = array('product' => $relative_product, 'errors' => $errors);
    }

}