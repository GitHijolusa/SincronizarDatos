//Filtro para el servicio web de lineas de venta

//Tipo de cliente pedidos diarios
const tipoCliente = ['GRAN CLIENTE', 'MERCADOS', 'REPARTO', 'RESTO RETAILS', 'OTROS'];
//Filtro para lineas de venta
const filtroTipoCliente = tipoCliente.map(tipo => `TipoCliente eq '${tipo}'`).join(' or ');
//Filtro completo de lineas de venta para pedidos diarios
export const filtroPedidosDiarios = `filter=(startswith(Document_No, 'PV') or startswith(Document_No, 'PREP')) and (${filtroTipoCliente})`



//Filtro lineas de venta Mercadona, Irmadona

//Clientes mercadona e irmadona
const cliente = ['C-00133', 'C-00656']
//Filtro por numero de cliente
const filtroCliente = cliente.map(id => `Sell_to_Customer_No eq '${id}'`).join(' or ')
//Filtro completo de lineas de venta Mercadona, Irmadona
export const filtroMercadona = `filter=startswith(Document_No, 'PV') and (${filtroCliente})`



//Filtro horas de carga Mercadona

//Clientes horas de carga
const clientes = ['MERCADONA SA', 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA'];
//Filtro por nombre de cliente
const filtroExp = clientes.map(cliente => `NombreCliente eq '${cliente.replace("'", "''")}'`).join(' or ');
//Filtro completo horas de carga
export const filtroHorasCarga = `filter=(${filtroExp})`


//Filtro direcciones de envío

//Clientes direcciones de envío
const clientesDir = ['C-00133', 'C-00656'];
//Filtro por clientes
const filtroDirClientes = clientesDir.map(id => `Customer_No eq '${id}'`).join(' or ');
//Filtro completo direcciones de envío
export const filtroDir = `filter=(${filtroDirClientes})`


//Filtro embalajes cliente/Producto

//Clientes seleccionados
const idClientes = ['C-00429', 'C-00988', 'C-01142', 'C-00071'];
//Filtro por cliente
const filtroClientes = idClientes.map(id => `Cliente eq '${id}'`).join(' or ');
//Filtro completo embalajes cliente/Producto
export const filtroEmbalaje = `filter=(${filtroClientes})`


