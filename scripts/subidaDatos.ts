import { ExpedicionAgrupada, ExpedicionPorPlataforma } from '../src/lib/types';
import { database } from '../firebaseConfig.js';
import { ref, update, get, set } from 'firebase/database';
import { groupBy, isEqual } from 'lodash';
import { clientesExcluidos, clientesRepartoPermitidos, otrosClientesPermitidos } from '../config/clientes_config';

// --- INTERFACES ---

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface LineasVentaAPI {
    Document_No: string;
    Line_No: number;
    Order_Date: string;
    NoPedidocliente: string;
    Sell_to_Customer_No: string;
    NombreCliente: string;
    TipoCliente: string;
    Plataforma: string;
    CodPlataforma: string;
    No: string;
    Description: string;
    Quantity: number;
    Kg: number;
    CantidadPalets: number;
    Cdadcaja: number;
    CdadcajaTotal: number;
    ModeloPalets: string;
    ModeloCajas: string;
    Purchase_Order_No: string;
}

interface LineasExp {
    NumPedido: string;
    HoraCarga: string;
    NombreCliente: string;
}

interface LineasVentaFiltrada {
    numPedido: string;
    Linea: number;
    FechaPedido: string;
    idCliente: string;
    Cliente: string;
    NoPedidocliente: string;
    TipoCliente: string;
    Plataforma: string;
    CodPlataforma: string;
    Producto: string;
    Descripcion: string;
    Cantidad: number;
    Kg: number;
    Palets: number;
    Cajas: number;
    CdadcajaTotal: number;
    ModeloPalets: string;
    ModeloCajas: string;
    purchaseOrder: string;
}

interface PedidoAgrupado {
    numPedido: string;
    fechaPedido: string;
    idCliente: string;
    cliente: string;
    NoPedidocliente: string;
    TipoCliente: string;
    plataforma: string;
    CodPlataforma: string;
    purchaseOrder: string;
    productos: Array<{
        Linea: number;
        producto: string;
        descripcion: string;
        cantidad: number;
        Kg: number;
        Palets: number;
        Cajas: number;
        CdadcajaTotal: number;
        ModeloPalets: string;
        ModeloCajas: string;
    }>;
    horasCarga?: string[];
}

interface LineasVentaMercadona {
  Document_No: string
  Line_No: number
  Order_Date: string
  Sell_to_Customer_No: string
  NombreCliente: string
  Plataforma: string
  No: string
  Description: string
  Quantity: number;
  Kg: number;
  CantidadPalets: number;
  Cdadcaja: number;
  CdadcajaTotal: number;
  ModeloPalets: string;
  ModeloCajas: string;
}

interface LineasVentaMercadonaFiltrada {
  numPedido: string;
  Linea: number
  FechaPedido: string
  idCliente: string
  Cliente: string
  Plataforma: string;
  Producto: string
  Descripcion: string
  Cantidad: number;
  Kg: number;
  Palets: number;
  Cajas: number;
  CdadcajaTotal:number;
  ModeloPalets: string;
  ModeloCajas: string;
}

interface horasExp {
    Numero: string;
    FechaEnvio: string;
    HoraCarga: string;
    Plataforma: string;
    No: string;
    NumPaletsCompleto: number;
    NumCajasPico:number;
    NombreCliente: string;
    NumPedido: string;
}

interface expCamion {
    Numero: string;
    Shipping_Agent_Code: string;
    Name: string;
    proveedor?: {
        Name: string;
    };
}
  
interface Direccion {
    Code: string;
    City: string;
}

interface Proveedores {

    No: string
    Name: string
}

interface ClienteProductoAPI {
    Item_No: string;
    Cliente: string; 
    Description: string;
    Nombre_Cliente?: string; 
}
  
interface EnrichedProduct {
    Item_No: string;
    Cliente: string;
    Description: string;
    Nombre_Cliente: string;
}
  
// --- CONFIGURACIÓN ---

const tokenEndpoint = 'https://login.microsoftonline.com/eaef5c77-b0af-4131-81cf-ceb195e3389c/oauth2/v2.0/token';
const baseUrl = 'https://api.businesscentral.dynamics.com/v2.0/eaef5c77-b0af-4131-81cf-ceb195e3389c/Production/ODataV4/';
const companyName = 'Patatas%20Hijolusa%2C%20S.A.U';
const encodeCompany = encodeURIComponent(companyName);
const myClientId = '39f3eb2e-e404-4648-aebf-6fdcf9883134';
const myClientSecret = 'ik.8Q~1ehaUuSHYU2Uc7IWxf7dDfbz5f2TTndbwc';
const scope = 'https://api.businesscentral.dynamics.com/.default';

// --- FUNCIONES AUXILIARES ---

const clientNames: Record<string, string> = {
    "C-00429": "AHORRAMAS",
    "C-00988": "DIA",
    "C-01142": "ALDI",
    "C-00071": "GADISA",
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function getAccessToken(): Promise<string> {
    const body = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': myClientId,
        'client_secret': myClientSecret,
        'scope': scope,
    });

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener el token: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const tokenData: TokenResponse = await response.json();
        return tokenData.access_token;

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error durante la generación del token:', error.message);
        }
        throw error;
    }
}

//Función para agrupar los pedidos diarios
function agruparPedidos(lineasVenta: LineasVentaFiltrada[], horasCargaPedido: Map<string, string[]>): PedidoAgrupado[] {
    const pedidosAgrupados: { [key: string]: PedidoAgrupado } = {};

    lineasVenta.forEach(linea => {
        if (!pedidosAgrupados[linea.numPedido]) {
            const horas = horasCargaPedido.get(linea.numPedido) || [];
            const horasUnicas = Array.from(new Set(horas));

            pedidosAgrupados[linea.numPedido] = {
                numPedido: linea.numPedido,
                fechaPedido: linea.FechaPedido,
                idCliente: linea.idCliente,
                cliente: linea.Cliente,
                NoPedidocliente: linea.NoPedidocliente,
                TipoCliente: linea.TipoCliente,
                plataforma: linea.Plataforma,
                CodPlataforma: linea.CodPlataforma,
                purchaseOrder: linea.purchaseOrder || '',
                productos: [],
                horasCarga: horasUnicas.sort(),
            };
        }

        pedidosAgrupados[linea.numPedido].productos.push({
            Linea: linea.Linea,
            producto: linea.Producto,
            descripcion: linea.Descripcion,
            cantidad: linea.Cantidad,
            Kg: linea.Kg,
            Palets: linea.Palets,
            Cajas: linea.Cajas,
            CdadcajaTotal: linea.CdadcajaTotal,
            ModeloPalets: linea.ModeloPalets,
            ModeloCajas: linea.ModeloCajas,
        });
    });

    Object.values(pedidosAgrupados).forEach(pedido => {
        pedido.productos.sort((a, b) => a.Linea - b.Linea);
    });

    return Object.values(pedidosAgrupados);
}

//Función que agrupa los pedidos de Mercadona por plataforma
function agruparPedidosMercadona(lineasVenta: LineasVentaMercadonaFiltrada[]) {
    const specialProductPrefixes = ["PV", "BT"];

    const specialProducts = lineasVenta.filter(linea => 
      specialProductPrefixes.some(prefix => linea.Producto.includes(prefix))
    );
    
    const regularProducts = lineasVenta.filter(linea => 
      !specialProductPrefixes.some(prefix => linea.Producto.includes(prefix))
    );
    
    const pedidosAgrupados: { [key: string]: any } = {};

    const processProducts = (productos: LineasVentaMercadonaFiltrada[], aAgrupar: { [key: string]: any }) => {
        productos.forEach(linea => {
            let key = linea.Plataforma.trim();
            let displayPlatform = linea.Plataforma.trim();
            
            if (linea.Plataforma.trim() === "Villadangos A-1012" || linea.Plataforma.trim() === "Villadangos 2 A-1156") {
                key = 'VILLADANGOS';
                displayPlatform = 'VILLADANGOS'
            }

            if (!aAgrupar[key]) {
                aAgrupar[key] = {
                    numPedido: linea.numPedido,
                    cliente: linea.Cliente,
                    idCliente: linea.idCliente,
                    fechaPedido: linea.FechaPedido,
                    plataforma: displayPlatform,
                    status: 'Pendiente',
                    isManual: false,
                    productos: [],
                };
            }

            const productoExistente = aAgrupar[key].productos.find((p: any) => p.producto === linea.Producto);

            if (productoExistente) {
                productoExistente.cantidad += linea.Cantidad;
                productoExistente.Kg += linea.Kg;
                productoExistente.Palets += linea.Palets;
                productoExistente.Cajas += linea.Cajas;
                productoExistente.CdadcajaTotal += linea.CdadcajaTotal;
            } else {
                aAgrupar[key].productos.push({
                    linea: linea.Linea,
                    producto: linea.Producto,
                    descripcion: linea.Descripcion,
                    cantidad: linea.Cantidad,
                    Kg: linea.Kg,
                    Palets: linea.Palets,
                    Cajas: linea.Cajas,
                    CdadcajaTotal: linea.CdadcajaTotal,
                    ModeloPalets: linea.ModeloPalets,
                    ModeloCajas: linea.ModeloCajas,
                    isChecked: false,
                    numPedido: linea.numPedido,
                });
            }
        });
    };
    
    processProducts(regularProducts, pedidosAgrupados);

    let finalResponse = Object.values(pedidosAgrupados);

    if (specialProducts.length > 0) {
        const microAgrupado = groupBy(specialProducts, 'Plataforma');
        
        const microCard = {
            numPedido: 'MICRO',
            cliente: specialProducts[0]?.Cliente || 'MERCADONA SA',
            idCliente: specialProducts[0]?.idCliente || 'C-00133',
            fechaPedido: specialProducts[0]?.FechaPedido,
            plataforma: 'MICRO',
            status: 'Pendiente',
            isManual: false,
            productos: Object.entries(microAgrupado).map(([plataforma, productos]) => {
                const groupedSubProducts = groupBy(productos, 'Producto');

                const subProductosAgregados = Object.entries(groupedSubProducts).map(([productName, productEntries]) => {
                    const firstEntry = productEntries[0];
                    const aggregated = productEntries.reduce((acc, current) => {
                        acc.cantidad += current.Cantidad;
                        acc.Kg += current.Kg;
                        acc.Palets += current.Palets;
                        acc.Cajas += current.Cajas;
                        acc.CdadcajaTotal += current.CdadcajaTotal;
                        return acc;
                    }, {
                        // Generar un ID único combinando la línea original y el índice
                        linea: 0, // Será reemplazado después
                        producto: firstEntry.Producto,
                        descripcion: firstEntry.Descripcion,
                        cantidad: 0,
                        Kg: 0,
                        Palets: 0,
                        Cajas: 0,
                        CdadcajaTotal: 0,
                        ModeloPalets: firstEntry.ModeloPalets,
                        ModeloCajas: firstEntry.ModeloCajas,
                        isChecked: false,
                        numPedido: firstEntry.numPedido,
                    });

                    // Asignar un ID de línea único para evitar colisiones
                    aggregated.linea = productEntries.reduce((sum, p) => sum + p.Linea, 0) + productEntries.length;

                    return aggregated;
                });

                return {
                    plataforma: plataforma,
                    subProductos: subProductosAgregados,
                };
            }),
        };
        finalResponse.push(microCard);
    }


    Object.values(pedidosAgrupados).forEach((pedido: any) => {
        if (pedido.productos) {
            pedido.productos.sort((a: any, b: any) => a.linea - b.linea);
            // Asignar línea única
            pedido.productos.forEach((producto: any, index: number) => {
                producto.linea = producto.linea * 1000 + index;
            });
        }
    });

    return finalResponse;
}

// --- FUNCIONES PRINCIPALES DE OBTENCIÓN DE DATOS ---

async function fetchApiData<T>(apiUrl: string, token: string): Promise<T[]> {
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la petición a la API ${apiUrl}: ${response.statusText}. Respuesta: ${errorText}`);
    }
    const data = await response.json();
    return data.value as T[];
}

//Función para obtener los pedidos que no son de los clientes Mercadona e Irmadona
async function getPedidos(token: string, customerType?: 'mercadona'): Promise<LineasVentaFiltrada[]> {
    const today = new Date();
    const TenDaysAgo = new Date(today);
    TenDaysAgo.setDate(today.getDate() - 10);
    const formattedDateForQuery = formatDate(TenDaysAgo);
    
    const apiPath = 'ConsultaLineasVenta';
    const tipoCliente = ['GRAN CLIENTE', 'MERCADOS', 'REPARTO', 'RESTO RETAILS', 'OTROS'];
    const filtroTipoCliente = tipoCliente.map(tipo => `TipoCliente eq '${tipo}'`).join(' or ');
    const apiEndpoint = `${baseUrl}Company('${encodeCompany}')/${apiPath}?$filter=(startswith(Document_No, 'PV') or startswith(Document_No, 'PREP')) and (${filtroTipoCliente}) and Order_Date ge ${formattedDateForQuery}`;

    try {
        const allLineasVenta = await fetchApiData<LineasVentaAPI>(apiEndpoint, token);
        const lineasConProducto = allLineasVenta.filter(linea => linea.No && linea.No.trim() !== '');

        let lineasPorCliente: LineasVentaAPI[];

        if (customerType === 'mercadona') {
             lineasPorCliente = lineasConProducto.filter(linea => {
                const cliente = linea.NombreCliente;
                return cliente === 'MERCADONA SA' || cliente === 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA';
            });
        } else {
            lineasPorCliente = lineasConProducto.filter(linea => {
                const cliente = linea.NombreCliente;
                const tipoCliente = linea.TipoCliente;
                
                if (tipoCliente === 'REPARTO') {
                    return clientesRepartoPermitidos.includes(cliente);
                }

                if (tipoCliente === 'OTROS') {
                    return otrosClientesPermitidos.includes(cliente);
                }
                
                return !clientesExcluidos.includes(cliente);
            });
        }

        const lineasFiltradas: LineasVentaFiltrada[] = lineasPorCliente.map(linea => {
            const esPingoDoce = linea.NombreCliente === 'PINGO DOCE - DISTRIBUIÇÃO ALIMENTAR, S.A.';
            return {
                numPedido: linea.Document_No,
                Linea: linea.Line_No,
                FechaPedido: linea.Order_Date,
                idCliente: linea.Sell_to_Customer_No,
                Cliente: linea.NombreCliente,
                TipoCliente: linea.TipoCliente,
                NoPedidocliente: linea.NoPedidocliente,
                Plataforma: esPingoDoce ? linea.CodPlataforma : linea.Plataforma,
                CodPlataforma: linea.CodPlataforma,
                Producto: linea.No,
                Descripcion: linea.Description,
                Cantidad: linea.Quantity,
                Kg: linea.Kg,
                Palets: linea.CantidadPalets,
                Cajas: linea.Cdadcaja,
                CdadcajaTotal: linea.CdadcajaTotal,
                ModeloPalets: linea.ModeloPalets,
                ModeloCajas: linea.ModeloCajas,
                purchaseOrder: linea.Purchase_Order_No || ''
            };
        });

        return lineasFiltradas;

    } catch (error) {
        if (error instanceof Error) {
            console.error('Ha ocurrido un error al obtener los datos:', error.message);
        }
        throw error;
    }
}

//Función para obtener los pedidos de Mercadona
async function getPedidosMercadona(token: string, startDate: string): Promise<LineasVentaMercadonaFiltrada[]> {
    const apiPath = 'ConsultaLineasVenta'
    const cliente = ['C-00133', 'C-00656']
    const filtroCliente = cliente.map(id => `Sell_to_Customer_No eq '${id}'`).join(' or ')
    const apiEndpoint = `${baseUrl}Company('${encodeCompany}')/${apiPath}?$filter=(${filtroCliente}) and Order_Date ge ${startDate}`

    try {
        const lineasVenta = await fetchApiData<LineasVentaMercadona>(apiEndpoint, token);
        const lineasConProducto = lineasVenta.filter(linea => {
            if (linea.NombreCliente === 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA' && linea.Plataforma === 'VILA NOVA DE GAIA') {
                return false;
            }
            if (linea.NombreCliente === 'MERCADONA SA' && linea.Plataforma === 'ALBALAT DELS SORELLS') {
                return false;
            }
            return linea.No && linea.No.trim() !== '';
        });

        const lineasFiltradas: LineasVentaMercadonaFiltrada[] = lineasConProducto.map(linea => {
            return {
                numPedido: linea.Document_No,
                Linea: linea.Line_No,
                FechaPedido: linea.Order_Date,
                idCliente: linea.Sell_to_Customer_No,
                Cliente: linea.NombreCliente,
                Plataforma: linea.Plataforma,
                Producto: linea.No,
                Descripcion: linea.Description,
                Cantidad: linea.Quantity,
                Kg: linea.Kg,
                Palets: linea.CantidadPalets,
                Cajas: linea.Cdadcaja,
                CdadcajaTotal: linea.CdadcajaTotal,
                ModeloPalets: linea.ModeloPalets,
                ModeloCajas: linea.ModeloCajas,
            };
        });

        return lineasFiltradas;

    } catch (error) {
        if (error instanceof Error) {
            console.error('Ha ocurrido un error al obtener los datos de Mercadona:', error.message);
        }
        throw error;
    }
}

//Función para obtener las expediciones por hora de carga y plataforma
async function getHorasCarga(token: string, date: Date) {
    const formattedDate = formatDate(date);
    const clientes = ['MERCADONA SA', 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA'];
    const filtroExp = clientes.map(cliente => `NombreCliente eq '${cliente.replace("'", "''")}'`).join(' or ');
    const apiExp = `lineasExpdici%C3%B3n?$filter=(${filtroExp}) and FechaEnvio eq ${formattedDate}`;

    const idClientes = ['C-00133', 'C-00656'];
    const direccionEnvioFilter = idClientes.map(id => `Customer_No eq '${id}'`).join(' or ');
    const apiDireccionesEnvio = `DireccionesEnvio?$filter=(${direccionEnvioFilter})`;

    const urlExp = `${baseUrl}Company('${encodeCompany}')/${apiExp}`;
    const urlDirecciones = `${baseUrl}Company('${encodeCompany}')/${apiDireccionesEnvio}`;

    const filtroExpCam = `Expediciones?$filter=(FechaEnvio eq ${formattedDate})`;
    const urlExpCamion = `${baseUrl}Company('${encodeCompany}')/${filtroExpCam}`;
    
    const urlProveedores = `${baseUrl}Company('${encodeCompany}')/Proveedores`;

    try {
        const horasCarga = await fetchApiData<horasExp>(urlExp, token);
        if (horasCarga.length === 0) {
            console.log(`No se encontraron horas de carga para la fecha ${formattedDate}.`);
            return []; // Devuelve un array vacío si no hay datos
        }

        const [direcciones, expedicionesCamion, proveedores] = await Promise.all([
            fetchApiData<Direccion>(urlDirecciones, token),
            fetchApiData<expCamion>(urlExpCamion, token),
            fetchApiData<Proveedores>(urlProveedores, token)
        ]);

        const direccionesMap = new Map(direcciones.map(d => [d.Code, d.City]));
        const proveedoresMap = new Map(proveedores.map(p => [p.No, p.Name]));

        const conductoresMap = new Map(expedicionesCamion.map(e => {
            const conductorName = proveedoresMap.get(e.Shipping_Agent_Code) || e.Name || e.Shipping_Agent_Code;
            return [e.Numero, conductorName];
        }));

        const expedicionesConCiudad = horasCarga.map(exp => ({
            ...exp,
            Plataforma: direccionesMap.get(exp.Plataforma) || exp.Plataforma
        }));

        const expedicionesConConductor = expedicionesConCiudad.map(exp => ({
            ...exp,
            Conductor: conductoresMap.get(exp.Numero) || ''
        }));

        const groupedByHora = groupBy(expedicionesConConductor, 'HoraCarga');

        const result: ExpedicionAgrupada[] = Object.entries(groupedByHora).map(([horaCarga, items]) => {
            const groupedByPlataforma = groupBy(items, 'Plataforma');

            const plataformas: ExpedicionPorPlataforma[] = Object.entries(groupedByPlataforma).map(([plataforma, productos]) => ({
                plataforma,
                productos: productos.map(({ No, NumPaletsCompleto, NumCajasPico, Numero, NumPedido, Conductor }) => ({
                    No,
                    NumPaletsCompleto,
                    NumCajasPico,
                    Numero,
                    NumPedido,
                    Conductor,
                })),
            }));

            const plataformasFiltradas = plataformas.filter(p => {
                const platformsToFilter = ["Ribarroja A-1246", "Parc Sagunt A-1105", "San Isidro A-1157"];
                const productsToFilter = ["MM50", "GRN80"];

                if (platformsToFilter.includes(p.plataforma.trim())) {
                    const productNames = p.productos.map(prod => prod.No);
                    const hasOnlyFilterProducts = productNames.every(name => productsToFilter.includes(name));
                    return !hasOnlyFilterProducts;
                }
                return true;
            });

            return {
                horaCarga,
                plataformas: plataformasFiltradas,
            };
        }).filter(expedicion => expedicion.plataformas.length > 0);

        return result;

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Ha ocurrido un error al obtener las horas carga Mercadona para la fecha ${formattedDate}:`, error.message);
        }
        return []; // Devuelve un array vacío en caso de error
    }
}

function enrichProductsWithClientNames(products: ClienteProductoAPI[]): EnrichedProduct[] {
    return products.map(item => ({
      ...item,
      Nombre_Cliente: item.Nombre_Cliente || clientNames[item.Cliente] || 'Desconocido'
    }));
  }
  
  function groupProducts(products: EnrichedProduct[]): Record<string, string[]> {
      const productosAgrupados: Record<string, string[]> = {};
      products.forEach(item => {
          const clientName = item.Nombre_Cliente;
          if (!clientName || clientName === 'Desconocido') return;
  
          if (!productosAgrupados[clientName]) {
              productosAgrupados[clientName] = [];
          }
          if (item.Item_No && !productosAgrupados[clientName].includes(item.Item_No)) {
              productosAgrupados[clientName].push(item.Item_No);
          }
      });
      return productosAgrupados;
  }

//Función que obtiene los productos de cliente de la lista embalaje cliente/producto para seleccionar los productos de sobras
async function getProductosCliente () {

    const idClientes = ['C-00429', 'C-00988', 'C-01142', 'C-00071'];
    const filtroClientes = idClientes.map(id => `Cliente eq '${id}'`).join(' or ');
    
    const apiEmbalajeClienteProducto = `EmblajeClienteProducto?$filter=(${filtroClientes})`;
  
    const embalajeEndpoint = `${baseUrl}Company('${encodeCompany}')/${apiEmbalajeClienteProducto}`;

    try {
        const token = await getAccessToken();
        const embalajeProducts = await fetchApiData<ClienteProductoAPI>(embalajeEndpoint, token);

        const enrichedProducts = enrichProductsWithClientNames(embalajeProducts);
        
        const productosAgrupados = groupProducts(enrichedProducts);
        
        return productosAgrupados;

    }catch(error) {
        if(error instanceof Error) {
            console.error('Ha ocurrido un error al obtener los productos de cliente:', error.message);
        }
    }
}

// --- FUNCIÓN PRINCIPAL ---

async function main() {
    try {
        console.log('Iniciando subida de datos...');
        const token = await getAccessToken();
        const today = new Date();
        const tenDaysAgo = new Date(today);
        tenDaysAgo.setDate(today.getDate() - 5);
        const formattedTenDaysAgo = formatDate(tenDaysAgo);

        // --- PEDIDOS GENERALES ---
        console.log('Procesando pedidos generales...');
        const apiExp = 'lineasExpdici%C3%B3n';
        const lineasExpedicionUrl = `${baseUrl}Company('${encodeCompany}')/${apiExp}`;
        const expedicionesData = await fetchApiData<LineasExp>(lineasExpedicionUrl, token);

        const horasDeCargaPorPedido = new Map<string, string[]>();
        expedicionesData.forEach((expedicion: LineasExp) => {
            if (!horasDeCargaPorPedido.has(expedicion.NumPedido)) {
                horasDeCargaPorPedido.set(expedicion.NumPedido, []);
            }
            if (expedicion.HoraCarga) {
                horasDeCargaPorPedido.get(expedicion.NumPedido)!.push(expedicion.HoraCarga);
            }
        });
        
        const lineasVentaData = await getPedidos(token);
        const pedidosApi = agruparPedidos(lineasVentaData, horasDeCargaPorPedido);
        
        console.log('Obteniendo pedidos generales existentes de Firebase...');
        const allOrdersRef = ref(database, 'allOrders');
        const snapshot = await get(allOrdersRef);
        const firebaseData = snapshot.val() || {};
        
        const firebaseOrderMap = new Map<string, any>();
        Object.keys(firebaseData).forEach(date => {
            const dateOrders = firebaseData[date];
            Object.keys(dateOrders).forEach(orderId => {
                firebaseOrderMap.set(orderId, { ...dateOrders[orderId], originalDate: date });
            });
        });

        console.log(`${firebaseOrderMap.size} pedidos generales encontrados en Firebase.`);

        const updates: { [key: string]: any } = {};
        let newOrdersCount = 0;
        let updatedOrdersCount = 0;
        let deletedOrdersCount = 0;


        pedidosApi.forEach(pedido => {
            const orderDate = pedido.fechaPedido.split('T')[0];
            const path = `allOrders/${orderDate}/${pedido.numPedido}`;
            const existingOrder = firebaseOrderMap.get(pedido.numPedido);

            if (!existingOrder) {
                updates[path] = {
                    ...pedido,
                    status: 'Pendiente',
                    isNew: true, // Marcar como nuevo
                    productos: (pedido.productos || []).map(p => ({
                        ...p,
                        checkState: 'unchecked',
                    })),
                };
                newOrdersCount++;
            } else {

                if (existingOrder.originalDate && existingOrder.originalDate !== orderDate) {
                    const oldPath = `allOrders/${existingOrder.originalDate}/${pedido.numPedido}`;
                    updates[oldPath] = null; 
                    deletedOrdersCount++;
                }

                const existingProducts = existingOrder.productos?.map((p: any) => {
                    return {
                        ...p,
                        checkState: p.checkState ?? 'unchecked',
                    };
                }) || [];

                 const mergedOrder = {
                    ...existingOrder, 
                    ...pedido, 
                    productos: pedido.productos.map(apiProduct => {
                        const existingProduct = existingProducts.find((p: { Linea: number; }) => p.Linea === apiProduct.Linea);
                        return {
                            ...apiProduct,
                            checkState: existingProduct?.checkState ?? 'unchecked'
                        };
                    })
                };

                if (!isEqual(existingOrder, mergedOrder)) {
                    updates[path] = mergedOrder;
                    updatedOrdersCount++;
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
            console.log(`${newOrdersCount} nuevos pedidos generales añadidos. ${updatedOrdersCount} pedidos existentes actualizados. ${deletedOrdersCount} pedidos antiguos eliminados por cambio de fecha.`);
        } else {
            console.log('No se encontraron nuevos pedidos generales para añadir o actualizar.');
        }

        // --- PEDIDOS MERCADONA ---
        console.log('\nProcesando pedidos de Mercadona...');
        const mercadonaLinesData = await getPedidosMercadona(token, formattedTenDaysAgo);

        if (mercadonaLinesData.length > 0) {
            const pedidosPorFecha = groupBy(mercadonaLinesData, (linea) => linea.FechaPedido.split('T')[0]);

            for (const fecha of Object.keys(pedidosPorFecha)) {
                console.log(`Procesando Mercadona para fecha: ${fecha}`);
                const pedidosDelDia = pedidosPorFecha[fecha];
                const pedidosMercadonaApi = agruparPedidosMercadona(pedidosDelDia);

                if (pedidosMercadonaApi.length > 0) {
                    const mercadonaRef = ref(database, `mercadona/${fecha}`);
                    const snapshotMercadona = await get(mercadonaRef);
                    const firebaseMercadonaData = snapshotMercadona.val() || [];

                    const firebaseMercadonaMap = new Map<string, any>();
                    const dataAsArray = Array.isArray(firebaseMercadonaData)
                        ? firebaseMercadonaData
                        : Object.values(firebaseMercadonaData);

                    dataAsArray.forEach((pedido: any, index: number) => {
                        if(pedido) { 
                            const key = pedido.plataforma === 'MICRO' ? 'MICRO' : pedido.plataforma.trim();
                            firebaseMercadonaMap.set(key, { ...pedido, originalIndex: index });
                        }
                    });

                    const mercadonaUpdates: { [key: string]: any } = {};
                    let newMercadonaCount = 0;
                    let updatedMercadonaCount = 0;
                    let nextNewIndex = dataAsArray.filter(Boolean).length;

                    pedidosMercadonaApi.forEach((pedidoApi: any) => {
                        const key = pedidoApi.plataforma === 'MICRO' ? 'MICRO' : pedidoApi.plataforma.trim();
                        const existingOrderData = firebaseMercadonaMap.get(key);

                        if (!existingOrderData) {
                            // Pedido nuevo
                            const newOrder = {
                                ...pedidoApi,
                                isNew: true, // Marcar como nuevo
                                productos: (pedidoApi.productos || []).map((p: any) => ({ ...p, checkState: 'unchecked', note: '' }))
                            };
                            mercadonaUpdates[`mercadona/${fecha}/${nextNewIndex}`] = newOrder;
                            newMercadonaCount++;
                            nextNewIndex++;
                        } else {
                            // Pedido existente, fusionar y comprobar cambios
                            const { originalIndex, ...existingOrder } = existingOrderData;

                            const mergedOrder = {
                                ...pedidoApi,
                                ...existingOrder,
                                productos: (pedidoApi.productos || []).map((apiProduct: any) => {
                                    const existingProduct = (existingOrder.productos || []).find((p: any) => p.linea === apiProduct.linea);
                                    return {
                                        ...apiProduct,
                                        checkState: existingProduct?.checkState ?? 'unchecked',
                                        note: existingProduct?.note ?? '',
                                        variedad: existingProduct?.variedad ?? '',
                                        origen: existingProduct?.origen ?? ''
                                    };
                                })
                            };
                            
                             if (pedidoApi.plataforma === 'MICRO' && mergedOrder.productos) {
                                mergedOrder.productos = pedidoApi.productos.map((apiPlat: any) => {
                                    const existingPlat = (existingOrder.productos || []).find((p: any) => p.plataforma === apiPlat.plataforma);
                                    if (existingPlat) {
                                        return {
                                            ...apiPlat,
                                            subProductos: apiPlat.subProductos.map((apiSub: any) => {
                                                const existingSub = (existingPlat.subProductos || []).find((s: any) => s.producto === apiSub.producto);
                                                return {
                                                    ...apiSub,
                                                    checkState: existingSub?.checkState ?? 'unchecked',
                                                    note: existingSub?.note ?? '',
                                                    variedad: existingSub?.variedad ?? '',
                                                    origen: existingSub?.origen ?? ''
                                                };
                                            })
                                        };
                                    }
                                    return apiPlat;
                                });
                            }


                            if (!isEqual(existingOrder, mergedOrder)) {
                                mercadonaUpdates[`mercadona/${fecha}/${originalIndex}`] = mergedOrder;
                                updatedMercadonaCount++;
                            }
                        }
                    });

                    if (Object.keys(mercadonaUpdates).length > 0) {
                        await update(ref(database), mercadonaUpdates);
                        console.log(`Mercadona (${fecha}): ${newMercadonaCount} nuevos añadidos, ${updatedMercadonaCount} actualizados.`);
                    } else {
                        console.log(`Mercadona (${fecha}): Sin cambios.`);
                    }
                }
            }
        } else {
            console.log('No se encontraron pedidos de Mercadona en el rango de fechas especificado.');
        }

        // --- HORAS CARGA MERCADONA ---
        console.log('\nProcesando horas de carga de Mercadona para los últimos días...');
        for (let i = -2; i < 3; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() - i);
            const formattedDate = formatDate(targetDate);
            
            console.log(`Obteniendo horas de carga para ${formattedDate}...`);
            const horasCargaData = await getHorasCarga(token, targetDate);

            if (horasCargaData && horasCargaData.length > 0) {
                const horasCargaRef = ref(database, `horasCargaMercadona/${formattedDate}`);
                await set(horasCargaRef, horasCargaData);
                console.log(`Horas de carga de Mercadona para ${formattedDate} guardadas en Firebase.`);
            } else {
                console.log(`No se encontraron horas de carga de Mercadona para ${formattedDate}, no se guardará nada.`);
            }
        }

        // --- PRODUCTOS CLIENTE ---
        console.log('\nProcesando productos de cliente...');
        const productosCliente = await getProductosCliente();
        const productosClienteRef = ref(database, 'productosCliente');
        await set(productosClienteRef, productosCliente);
        console.log('Productos de cliente guardados en Firebase.');

        console.log('\nSubida de datos completada con éxito.');

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error en el proceso principal:', error.message);
        } else {
            console.error('Ocurrió un error desconocido en el proceso principal.');
        }
    }
}
// Descomenta la siguiente línea para ejecutar la función al correr el script
main();
