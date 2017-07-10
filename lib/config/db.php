<?php

return array(
    'shop_product_link' => array(
        'id' => array('int', 11, 'null' => 0, 'autoincrement' => 1),
        'prod_id' => array('int', 11, 'null' => 0),
        'parent_prod_id' => array('int', 11, 'null' => 0),
        'type' => array('varchar', 10, 'null' => 0, 'default' => 'basic'),
        ':keys' => array(
            'PRIMARY' => 'id',
        ),
        ':options' => array('engine' => 'MyISAM')
    )
);
