"use strict";
//Filtro para el servicio web de lineas de venta
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtroEmbalaje = exports.filtroDir = exports.filtroHorasCarga = exports.filtroMercadona = exports.filtroPedidosDiarios = void 0;
//Tipo de cliente pedidos diarios
var tipoCliente = ['GRAN CLIENTE', 'MERCADOS', 'REPARTO', 'RESTO RETAILS', 'OTROS', 'INDUSTRIA'];
//Filtro para lineas de venta
var filtroTipoCliente = tipoCliente.map(function (tipo) { return "TipoCliente eq '".concat(tipo, "'"); }).join(' or ');
//Filtro completo de lineas de venta para pedidos diarios
exports.filtroPedidosDiarios = "filter=(startswith(Document_No, 'PV') or startswith(Document_No, 'PREP')) and (".concat(filtroTipoCliente, ")");
//Filtro lineas de venta Mercadona, Irmadona
//Clientes mercadona e irmadona
var cliente = ['C-00133', 'C-00656'];
//Filtro por numero de cliente
var filtroCliente = cliente.map(function (id) { return "Sell_to_Customer_No eq '".concat(id, "'"); }).join(' or ');
//Filtro completo de lineas de venta Mercadona, Irmadona
exports.filtroMercadona = "filter=startswith(Document_No, 'PV') and (".concat(filtroCliente, ")");
//Filtro horas de carga Mercadona
//Clientes horas de carga
var clientes = ['MERCADONA SA', 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA'];
//Filtro por nombre de cliente
var filtroExp = clientes.map(function (cliente) { return "NombreCliente eq '".concat(cliente.replace("'", "''"), "'"); }).join(' or ');
//Filtro completo horas de carga
exports.filtroHorasCarga = "filter=(".concat(filtroExp, ")");
//Filtro direcciones de envío
//Clientes direcciones de envío
var clientesDir = ['C-00133', 'C-00656'];
//Filtro por clientes
var filtroDirClientes = clientesDir.map(function (id) { return "Customer_No eq '".concat(id, "'"); }).join(' or ');
//Filtro completo direcciones de envío
exports.filtroDir = "filter=(".concat(filtroDirClientes, ")");
//Filtro embalajes cliente/Producto
//Clientes seleccionados
var idClientes = ['C-00429', 'C-00988', 'C-01142', 'C-00071'];
//Filtro por cliente
var filtroClientes = idClientes.map(function (id) { return "Cliente eq '".concat(id, "'"); }).join(' or ');
//Filtro completo embalajes cliente/Producto
exports.filtroEmbalaje = "filter=(".concat(filtroClientes, ")");
