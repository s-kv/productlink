<?php

return array(
    // обязательные параметры
    'name' => 'Взаимосвязи продуктов',
    'img' => 'img/productlink.png',
    'description' => 'Взаимосвязи продуктов',
    'version' => '1.0',
    // соответствие событие => обработчик (название метода в классе плагина),
    // если плагину нужно обрабатывать какие-то события
    'handlers' => array(
      //  'frontend_product' => 'frontend_product',
        'backend_product' => 'backend_product',
      //  'backend_products' => 'backend_products',
      //  'product_save' => 'product_save',
      //...
    )
);