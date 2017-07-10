<?php

class shopProductlinkPluginBackendLinkTypeChangeController extends waJsonController
{
    public function execute()
    {
        $product_id = waRequest::get('product_id', 0, waRequest::TYPE_INT);
        $relative_product_id = waRequest::get('relative_product_id', 0, waRequest::TYPE_INT);
        $is_revert = (bool)waRequest::get('is_revert', 0, waRequest::TYPE_INT);
        $type = waRequest::get('type', null, waRequest::TYPE_STRING_TRIM);
        
        if(!in_array($type, array_keys(shopProductlinkPlugin::$link_types))) 
                $type = 'basic';

        $link_model = new shopProductlinkPluginModel();
        
        if(!$is_revert)
            $link_model->exec("
                UPDATE {$link_model->getTableName()}
                SET `type` = s:type
                WHERE prod_id = i:product_id AND parent_prod_id = i:relative_product_id
                ", array('product_id' => $product_id, 'relative_product_id' => $relative_product_id, 'type' => $type)
            );
        else
            $link_model->exec("
                UPDATE {$link_model->getTableName()}
                SET `type` = s:type
                WHERE prod_id = i:product_id AND parent_prod_id = i:relative_product_id
                ", array('product_id' => $relative_product_id, 'relative_product_id' => $product_id, 'type' => $type)
            );            
    }

}