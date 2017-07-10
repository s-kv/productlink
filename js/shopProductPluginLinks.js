/**
 * @author Vasiliy Popov <intertorg.msk@gmail.com>
 */

$('table#links-table, table#links-table2').on('change', 'td.type select', function(){
    var that = $(this);
    var tr = that.closest('tr');
    var table = tr.closest('table');
    var product_id = table.data('product_id');
    var relative_product_id = tr.data('product_id');
    var type = $('option:selected', that).val();
    var id = $(this).attr('id');
    var is_revert = false;
    if(id == 'table#links-table2'){
        is_revert = true;
    }      
    that.addClass('in_change');
    $.get('?plugin=productlink&action=LinkTypeChange', {product_id: product_id, relative_product_id: relative_product_id, is_revert: is_revert, type: type}, function(){
        that.removeClass('in_change');
    });
    return false;
});

$('table#links-table, table#links-table2').on('click', 'a.remove', function(){
    var that = $(this);
    var tr = that.closest('tr');
    var table = tr.closest('table');
    var product_id = table.data('product_id');
    var relative_product_id = tr.data('product_id');
    var id = $(this).attr('id');            
    var is_revert = false;
    if(id == 'table#links-table2'){
        is_revert = true;
    }    
    that.hide();
    $.get('?plugin=productlink&action=LinkRemove', {product_id: product_id, relative_product_id: relative_product_id, is_revert: is_revert}, function(){
        tr.remove();
        if($('tr.sortable', table).length == 0)
            $('input[name = "product[accessory]"]').removeProp('disabled');
    });
    return false;
});

function shopProductAccessories_setFocus(product_id, is_revert)
{
    var o;
    if(!is_revert)        
        o = $('#links-table tr[data-product_id = ' + product_id + '] td.type select');
    else
        o = $('#links-table2 tr[data-product_id = ' + product_id + '] td.type select');
    o.focus();
}

$('#product-autocomplete-links, #product-autocomplete-links2').autocomplete({
    source: '?plugin=shop&action=autocomplete&limit=20',
    minLength: 3,
    delay: 300,
    select: function(event, ui){
        if(ui.item){
            var id = $(this).attr('id');            
            var p = ui.item;
            var is_revert = false;
            if(id == 'product-autocomplete-links2'){
                is_revert = true;
            }
            var table = !is_revert ? $('#links-table') : $('#links-table2');
            var tr = $('tr[data-product_id = ' + p.id + ']', table);
            if(tr.length){
                $('#product-autocomplete-links').val('');
                setTimeout('shopProductAccessories_setFocus(' + p.id + ',' + is_revert + ')', 0);
            }else{
                var product_id = table.data('product_id');
                var last_tr = $('tr:last', table);
                var sort = 1 + +last_tr.data('sort');
                $.get('?plugin=productlink&action=LinkAdd', {product_id: product_id, relative_product_id: p.id, sort: sort, is_revert: is_revert ? 1 : 0}, function(responce){
                    var product = responce.data.product;
                    var errors = responce.data.errors;
                    if(errors){
                        if(!is_revert){
                            $('#link-add-errors').html(errors).show();
                            setTimeout("$('#link-add-errors').hide();", 5000);
                        } else {
                            $('#link-add-errors2').html(errors).show();
                            setTimeout("$('#link-add-errors2').hide();", 5000);
                        }
                    }else if(product){
                        var table = !is_revert ? $('#links-table') : $('#links-table2');
                        var new_tr = $('tr[data-product_id = 0]', table).clone();
                        new_tr.attr('data-product_id', product.id).attr('data-sort', sort).addClass('sortable');
                        $('a.admin_link', new_tr).html(product.id).attr('href', '?action=products#/product/' + product.id + '/edit/');
                        $('a.store_link', new_tr).html(product.name).attr('href', product.frontend_url);
                        $('tbody', table).append(new_tr);
                        $('input[name = "product[accessory]"]').prop('disabled', true);
                        new_tr.show();
                        $('#product-autocomplete-links').val('');
                        $('#product-autocomplete-links2').val('');
                    }
                });
            }
        }
        return false;
    }
});