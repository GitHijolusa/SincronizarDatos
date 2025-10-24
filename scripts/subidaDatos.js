"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var firebaseConfig_js_1 = require("../firebaseConfig.js");
var database_1 = require("firebase/database");
var lodash_1 = require("lodash");
var clientes_config_1 = require("../config/clientes_config");
var ServiciosWeb_config_1 = require("../config/ServiciosWeb_config");
var usuario_config_1 = require("../config/usuario_config");
// --- CONFIGURACIÓN ---
var myClientSecret = 'ik.8Q~1ehaUuSHYU2Uc7IWxf7dDfbz5f2TTndbwc';
// --- FUNCIONES AUXILIARES ---
var clientNames = {
    "C-00429": "AHORRAMAS",
    "C-00988": "DIA",
    "C-01142": "ALDI",
    "C-00071": "GADISA",
};
function formatDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        var body, response, errorData, tokenData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = new URLSearchParams({
                        'grant_type': 'client_credentials',
                        'client_id': usuario_config_1.idCliente,
                        'client_secret': myClientSecret,
                        'scope': usuario_config_1.scopeBC,
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch(usuario_config_1.apiToken, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body,
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error("Error al obtener el token: ".concat(response.statusText, " - ").concat(JSON.stringify(errorData)));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    tokenData = _a.sent();
                    return [2 /*return*/, tokenData.access_token];
                case 6:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        console.error('Error durante la generación del token:', error_1.message);
                    }
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
//Función para agrupar los pedidos diarios
function agruparPedidos(lineasVenta, horasCargaPedido) {
    var pedidosAgrupados = {};
    lineasVenta.forEach(function (linea) {
        if (!pedidosAgrupados[linea.numPedido]) {
            var horas = horasCargaPedido.get(linea.numPedido) || [];
            var horasUnicas = Array.from(new Set(horas));
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
    Object.values(pedidosAgrupados).forEach(function (pedido) {
        pedido.productos.sort(function (a, b) { return a.Linea - b.Linea; });
    });
    return Object.values(pedidosAgrupados);
}
//Función que agrupa los pedidos de Mercadona por plataforma
function agruparPedidosMercadona(lineasVenta) {
    var _a, _b, _c;
    var specialProductPrefixes = ["PV", "BT"];
    var specialProducts = lineasVenta.filter(function (linea) {
        return specialProductPrefixes.some(function (prefix) { return linea.Producto.includes(prefix); });
    });
    var regularProducts = lineasVenta.filter(function (linea) {
        return !specialProductPrefixes.some(function (prefix) { return linea.Producto.includes(prefix); });
    });
    var pedidosAgrupados = {};
    var processProducts = function (productos, aAgrupar) {
        productos.forEach(function (linea) {
            var key = linea.Plataforma.trim();
            var displayPlatform = linea.Plataforma.trim();
            if (linea.Plataforma.trim() === "Villadangos A-1012" || linea.Plataforma.trim() === "Villadangos 2 A-1156") {
                key = 'VILLADANGOS';
                displayPlatform = 'VILLADANGOS';
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
            var productoExistente = aAgrupar[key].productos.find(function (p) { return p.producto === linea.Producto; });
            if (productoExistente) {
                productoExistente.cantidad += linea.Cantidad;
                productoExistente.Kg += linea.Kg;
                productoExistente.Palets += linea.Palets;
                productoExistente.Cajas += linea.Cajas;
                productoExistente.CdadcajaTotal += linea.CdadcajaTotal;
            }
            else {
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
    var finalResponse = Object.values(pedidosAgrupados);
    if (specialProducts.length > 0) {
        var pedidosEspecialesAgrupados = (0, lodash_1.groupBy)(specialProducts, 'numPedido');
        var productosMicro = Object.values(pedidosEspecialesAgrupados).flatMap(function (pedidoLines) {
            var _a;
            var plataforma = ((_a = pedidoLines[0]) === null || _a === void 0 ? void 0 : _a.Plataforma) || 'Desconocida';
            var groupedSubProducts = (0, lodash_1.groupBy)(pedidoLines, 'Producto');
            var subProductosAgregados = Object.entries(groupedSubProducts).map(function (_a, index) {
                var productName = _a[0], productEntries = _a[1];
                var firstEntry = productEntries[0];
                var aggregated = productEntries.reduce(function (acc, current) {
                    acc.cantidad += current.Cantidad;
                    acc.Kg += current.Kg;
                    acc.Palets += current.Palets;
                    acc.Cajas += current.Cajas;
                    acc.CdadcajaTotal += current.CdadcajaTotal;
                    return acc;
                }, {
                    linea: firstEntry.Linea,
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
                aggregated.linea = aggregated.linea * 1000 + index;
                return aggregated;
            });
            return {
                plataforma: plataforma,
                numPedido: pedidoLines[0].numPedido,
                subProductos: subProductosAgregados,
            };
        });
        var microCard = {
            numPedido: 'MICRO',
            cliente: ((_a = specialProducts[0]) === null || _a === void 0 ? void 0 : _a.Cliente) || 'MERCADONA SA',
            idCliente: ((_b = specialProducts[0]) === null || _b === void 0 ? void 0 : _b.idCliente) || 'C-00133',
            fechaPedido: (_c = specialProducts[0]) === null || _c === void 0 ? void 0 : _c.FechaPedido,
            plataforma: 'MICRO',
            status: 'Pendiente',
            isManual: false,
            productos: productosMicro,
        };
        finalResponse.push(microCard);
    }
    Object.values(pedidosAgrupados).forEach(function (pedido) {
        if (pedido.productos) {
            pedido.productos.sort(function (a, b) { return a.linea - b.linea; });
            // Asignar línea única
            pedido.productos.forEach(function (producto, index) {
                producto.linea = producto.linea * 1000 + index;
            });
        }
    });
    return finalResponse;
}
// --- FUNCIONES PRINCIPALES DE OBTENCIÓN DE DATOS ---
function fetchApiData(apiUrl, token) {
    return __awaiter(this, void 0, void 0, function () {
        var allData, nextLink, response, data, error_2, errorText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allData = [];
                    nextLink = apiUrl;
                    _a.label = 1;
                case 1:
                    if (!nextLink) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(nextLink, {
                            method: 'GET',
                            headers: { 'Authorization': "Bearer ".concat(token), 'Content-Type': 'application/json' },
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Error en la petici\u00F3n a la API ".concat(nextLink, ": ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    allData.push.apply(allData, data.value || []);
                    nextLink = data['@odata.nextLink'];
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    errorText = error_2 instanceof Error ? error_2.message : 'Error desconocido';
                    console.error("Error en la petici\u00F3n a la API ".concat(nextLink, ". Respuesta: ").concat(errorText));
                    return [2 /*return*/, []]; // Devuelve un array vacío en caso de error
                case 6: return [3 /*break*/, 1];
                case 7: return [2 /*return*/, allData];
            }
        });
    });
}
//Función para obtener los pedidos que no son de los clientes Mercadona e Irmadona
function getPedidos(token, date) {
    return __awaiter(this, void 0, void 0, function () {
        var tipoCliente, filtroTipoCliente, apiEndpoint, allLineasVenta, lineasConProducto, lineasPorCliente, lineasFiltradas, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tipoCliente = ['GRAN CLIENTE', 'MERCADOS', 'REPARTO', 'RESTO RETAILS', 'OTROS'];
                    filtroTipoCliente = tipoCliente.map(function (tipo) { return "TipoCliente eq '".concat(tipo, "'"); }).join(' or ');
                    apiEndpoint = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(ServiciosWeb_config_1.apiLineasVenta, "?$filter=(startswith(Document_No, 'PV') or startswith(Document_No, 'PREP')) and (").concat(filtroTipoCliente, ") and Order_Date ge ").concat(date);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchApiData(apiEndpoint, token)];
                case 2:
                    allLineasVenta = _a.sent();
                    lineasConProducto = allLineasVenta.filter(function (linea) { return linea.No && linea.No.trim() !== ''; });
                    lineasPorCliente = void 0;
                    lineasPorCliente = lineasConProducto.filter(function (linea) {
                        var cliente = linea.NombreCliente;
                        var tipoCliente = linea.TipoCliente;
                        if (tipoCliente === 'REPARTO') {
                            return clientes_config_1.clientesRepartoPermitidos.includes(cliente);
                        }
                        if (tipoCliente === 'OTROS') {
                            return clientes_config_1.otrosClientesPermitidos.includes(cliente);
                        }
                        return !clientes_config_1.clientesExcluidos.includes(cliente);
                    });
                    lineasFiltradas = lineasPorCliente.map(function (linea) {
                        var esPingoDoce = linea.NombreCliente === 'PINGO DOCE - DISTRIBUIÇÃO ALIMENTAR, S.A.';
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
                    return [2 /*return*/, lineasFiltradas];
                case 3:
                    error_3 = _a.sent();
                    if (error_3 instanceof Error) {
                        console.error('Ha ocurrido un error al obtener los datos:', error_3.message);
                    }
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Función para obtener los pedidos de Mercadona
function getPedidosMercadona(token, date) {
    return __awaiter(this, void 0, void 0, function () {
        var cliente, filtroCliente, apiEndpoint, lineasVenta, lineasConProducto, lineasFiltradas, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cliente = ['C-00133', 'C-00656'];
                    filtroCliente = cliente.map(function (id) { return "Sell_to_Customer_No eq '".concat(id, "'"); }).join(' or ');
                    apiEndpoint = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(ServiciosWeb_config_1.apiLineasVenta, "?$filter=startswith(Document_No, 'PV') and (").concat(filtroCliente, ") and Order_Date eq ").concat(date);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchApiData(apiEndpoint, token)];
                case 2:
                    lineasVenta = _a.sent();
                    lineasConProducto = lineasVenta.filter(function (linea) {
                        if (linea.NombreCliente === 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA' && linea.Plataforma === 'VILA NOVA DE GAIA') {
                            return false;
                        }
                        if (linea.NombreCliente === 'MERCADONA SA' && linea.Plataforma === 'ALBALAT DELS SORELLS') {
                            return false;
                        }
                        return linea.No && linea.No.trim() !== '';
                    });
                    lineasFiltradas = lineasConProducto.map(function (linea) {
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
                    return [2 /*return*/, lineasFiltradas];
                case 3:
                    error_4 = _a.sent();
                    if (error_4 instanceof Error) {
                        console.error('Ha ocurrido un error al obtener los datos de Mercadona:', error_4.message);
                    }
                    return [2 /*return*/, []]; // Devuelve un array vacío en caso de error
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Función para obtener las expediciones por hora de carga y plataforma
function getHorasCarga(token, date) {
    return __awaiter(this, void 0, void 0, function () {
        var formattedDate, clientes, filtroExp, apiExp, idClientes, direccionEnvioFilter, apiDirEnvio, urlExp, urlDirecciones, filtroExpCam, urlExpCamion, urlProveedores, horasCarga, _a, direcciones, expedicionesCamion, proveedores, direccionesMap_1, proveedoresMap_1, conductoresMap_1, expedicionesConCiudad, expedicionesConConductor, groupedByHora, result, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    formattedDate = formatDate(date);
                    clientes = ['MERCADONA SA', 'IRMÃDONA SUPERMERCADOS UNIPESSOAL, LDA'];
                    filtroExp = clientes.map(function (cliente) { return "NombreCliente eq '".concat(cliente.replace("'", "''"), "'"); }).join(' or ');
                    apiExp = "".concat(ServiciosWeb_config_1.apiExpediciones, "?$filter=(").concat(filtroExp, ") and FechaEnvio eq ").concat(formattedDate);
                    idClientes = ['C-00133', 'C-00656'];
                    direccionEnvioFilter = idClientes.map(function (id) { return "Customer_No eq '".concat(id, "'"); }).join(' or ');
                    apiDirEnvio = "".concat(ServiciosWeb_config_1.apiDireccionesEnvio, "?$filter=(").concat(direccionEnvioFilter, ")");
                    urlExp = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(apiExp);
                    urlDirecciones = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(apiDirEnvio);
                    filtroExpCam = "".concat(ServiciosWeb_config_1.apiExpedicionesCamion, "?$filter=(FechaEnvio eq ").concat(formattedDate, ")");
                    urlExpCamion = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(filtroExpCam);
                    urlProveedores = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(ServiciosWeb_config_1.apiProveedores);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetchApiData(urlExp, token)];
                case 2:
                    horasCarga = _b.sent();
                    if (horasCarga.length === 0) {
                        console.log("No se encontraron horas de carga para la fecha ".concat(formattedDate, "."));
                        return [2 /*return*/, []]; // Devuelve un array vacío si no hay datos
                    }
                    return [4 /*yield*/, Promise.all([
                            fetchApiData(urlDirecciones, token),
                            fetchApiData(urlExpCamion, token),
                            fetchApiData(urlProveedores, token)
                        ])];
                case 3:
                    _a = _b.sent(), direcciones = _a[0], expedicionesCamion = _a[1], proveedores = _a[2];
                    direccionesMap_1 = new Map(direcciones.map(function (d) { return [d.Code, d.City]; }));
                    proveedoresMap_1 = new Map(proveedores.map(function (p) { return [p.No, p.Name]; }));
                    conductoresMap_1 = new Map(expedicionesCamion.map(function (e) {
                        var conductorName = proveedoresMap_1.get(e.Shipping_Agent_Code) || e.Name || e.Shipping_Agent_Code;
                        return [e.Numero, conductorName];
                    }));
                    expedicionesConCiudad = horasCarga.map(function (exp) { return (__assign(__assign({}, exp), { Plataforma: direccionesMap_1.get(exp.Plataforma) || exp.Plataforma })); });
                    expedicionesConConductor = expedicionesConCiudad.map(function (exp) { return (__assign(__assign({}, exp), { Conductor: conductoresMap_1.get(exp.Numero) || '' })); });
                    groupedByHora = (0, lodash_1.groupBy)(expedicionesConConductor, 'HoraCarga');
                    result = Object.entries(groupedByHora).map(function (_a) {
                        var horaCarga = _a[0], items = _a[1];
                        var groupedByPlataforma = (0, lodash_1.groupBy)(items, 'Plataforma');
                        var plataformas = Object.entries(groupedByPlataforma).map(function (_a) {
                            var plataforma = _a[0], productos = _a[1];
                            return ({
                                plataforma: plataforma,
                                productos: productos.map(function (_a) {
                                    var No = _a.No, NumPaletsCompleto = _a.NumPaletsCompleto, NumCajasPico = _a.NumCajasPico, Numero = _a.Numero, NumPedido = _a.NumPedido, Conductor = _a.Conductor;
                                    return ({
                                        No: No,
                                        NumPaletsCompleto: NumPaletsCompleto,
                                        NumCajasPico: NumCajasPico,
                                        Numero: Numero,
                                        NumPedido: NumPedido,
                                        Conductor: Conductor,
                                    });
                                }),
                            });
                        });
                        var plataformasFiltradas = plataformas.filter(function (p) {
                            var platformsToFilter = ["Ribarroja A-1246", "Parc Sagunt A-1105", "San Isidro A-1157"];
                            var productsToFilter = ["MM50", "GRN80"];
                            if (platformsToFilter.includes(p.plataforma.trim())) {
                                var productNames = p.productos.map(function (prod) { return prod.No; });
                                var hasOnlyFilterProducts = productNames.every(function (name) { return productsToFilter.includes(name); });
                                return !hasOnlyFilterProducts;
                            }
                            return true;
                        });
                        return {
                            horaCarga: horaCarga,
                            plataformas: plataformasFiltradas,
                        };
                    }).filter(function (expedicion) { return expedicion.plataformas.length > 0; });
                    return [2 /*return*/, result];
                case 4:
                    error_5 = _b.sent();
                    if (error_5 instanceof Error) {
                        console.error("Ha ocurrido un error al obtener las horas carga Mercadona para la fecha ".concat(formattedDate, ":"), error_5.message);
                    }
                    return [2 /*return*/, []]; // Devuelve un array vacío en caso de error
                case 5: return [2 /*return*/];
            }
        });
    });
}
function enrichProductsWithClientNames(products) {
    return products.map(function (item) { return (__assign(__assign({}, item), { Nombre_Cliente: item.Nombre_Cliente || clientNames[item.Cliente] || 'Desconocido' })); });
}
function groupProducts(products) {
    var productosAgrupados = {};
    products.forEach(function (item) {
        var clientName = item.Nombre_Cliente;
        if (!clientName || clientName === 'Desconocido')
            return;
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
function getProductosCliente() {
    return __awaiter(this, void 0, void 0, function () {
        var idClientes, filtroClientes, embalajeEndpoint, token, embalajeProducts, enrichedProducts, productosAgrupados, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idClientes = ['C-00429', 'C-00988', 'C-01142', 'C-00071'];
                    filtroClientes = idClientes.map(function (id) { return "Cliente eq '".concat(id, "'"); }).join(' or ');
                    embalajeEndpoint = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(ServiciosWeb_config_1.apiEmbalajeClienteProducto, "?$filter=(").concat(filtroClientes, ")");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getAccessToken()];
                case 2:
                    token = _a.sent();
                    return [4 /*yield*/, fetchApiData(embalajeEndpoint, token)];
                case 3:
                    embalajeProducts = _a.sent();
                    enrichedProducts = enrichProductsWithClientNames(embalajeProducts);
                    productosAgrupados = groupProducts(enrichedProducts);
                    return [2 /*return*/, productosAgrupados];
                case 4:
                    error_6 = _a.sent();
                    if (error_6 instanceof Error) {
                        console.error('Ha ocurrido un error al obtener los productos de cliente:', error_6.message);
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// --- FUNCIÓN PRINCIPAL ---
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var token, today, sevenDaysAgo_1, formattedSevenDaysAgo, lineasExpedicionUrl, expedicionesData, horasDeCargaPorPedido_1, lineasVentaData, pedidosApi, allOrdersRef, snapshot, firebaseData_1, firebaseOrderMap_1, updates_1, newOrdersCount_1, updatedOrdersCount_1, deletedOrdersCount_1, apiOrderIds_1, _loop_1, i, i, targetDate, formattedDate, horasCargaData, horasCargaRef, productosCliente, productosClienteRef, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 20, , 21]);
                    console.log('Iniciando subida de datos...');
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    token = _a.sent();
                    today = new Date();
                    sevenDaysAgo_1 = new Date(today);
                    sevenDaysAgo_1.setDate(today.getDate() - 7);
                    formattedSevenDaysAgo = formatDate(sevenDaysAgo_1);
                    // --- PEDIDOS GENERALES ---
                    console.log('Procesando pedidos generales...');
                    lineasExpedicionUrl = "".concat(ServiciosWeb_config_1.UrlBC, "Company('").concat(ServiciosWeb_config_1.nombreEmpresa, "')/").concat(ServiciosWeb_config_1.apiExpediciones);
                    return [4 /*yield*/, fetchApiData(lineasExpedicionUrl, token)];
                case 2:
                    expedicionesData = _a.sent();
                    horasDeCargaPorPedido_1 = new Map();
                    expedicionesData.forEach(function (expedicion) {
                        if (!horasDeCargaPorPedido_1.has(expedicion.NumPedido)) {
                            horasDeCargaPorPedido_1.set(expedicion.NumPedido, []);
                        }
                        if (expedicion.HoraCarga) {
                            horasDeCargaPorPedido_1.get(expedicion.NumPedido).push(expedicion.HoraCarga);
                        }
                    });
                    return [4 /*yield*/, getPedidos(token, formattedSevenDaysAgo)];
                case 3:
                    lineasVentaData = _a.sent();
                    pedidosApi = agruparPedidos(lineasVentaData, horasDeCargaPorPedido_1);
                    console.log('Obteniendo pedidos generales existentes de Firebase...');
                    allOrdersRef = (0, database_1.ref)(firebaseConfig_js_1.database, 'allOrders');
                    return [4 /*yield*/, (0, database_1.get)(allOrdersRef)];
                case 4:
                    snapshot = _a.sent();
                    firebaseData_1 = snapshot.val() || {};
                    firebaseOrderMap_1 = new Map();
                    Object.keys(firebaseData_1).forEach(function (date) {
                        var dateOrders = firebaseData_1[date];
                        Object.keys(dateOrders).forEach(function (orderId) {
                            firebaseOrderMap_1.set(orderId, __assign(__assign({}, dateOrders[orderId]), { originalDate: date, id: orderId }));
                        });
                    });
                    console.log("".concat(firebaseOrderMap_1.size, " pedidos generales encontrados en Firebase."));
                    updates_1 = {};
                    newOrdersCount_1 = 0;
                    updatedOrdersCount_1 = 0;
                    deletedOrdersCount_1 = 0;
                    apiOrderIds_1 = new Set(pedidosApi.map(function (p) { return p.numPedido; }));
                    pedidosApi.forEach(function (pedido) {
                        var _a;
                        var orderDate = pedido.fechaPedido.split('T')[0];
                        var path = "allOrders/".concat(orderDate, "/").concat(pedido.numPedido);
                        var existingOrder = firebaseOrderMap_1.get(pedido.numPedido);
                        if (!existingOrder) {
                            updates_1[path] = __assign(__assign({}, pedido), { status: 'Pendiente', isNew: true, productos: (pedido.productos || []).map(function (p) { return (__assign(__assign({}, p), { checkState: 'unchecked' })); }) });
                            newOrdersCount_1++;
                        }
                        else {
                            if (existingOrder.originalDate && existingOrder.originalDate !== orderDate) {
                                var oldPath = "allOrders/".concat(existingOrder.originalDate, "/").concat(pedido.numPedido);
                                updates_1[oldPath] = null;
                            }
                            var existingProducts_1 = ((_a = existingOrder.productos) === null || _a === void 0 ? void 0 : _a.map(function (p) {
                                var _a;
                                return __assign(__assign({}, p), { checkState: (_a = p.checkState) !== null && _a !== void 0 ? _a : 'unchecked' });
                            })) || [];
                            var mergedOrder = __assign(__assign(__assign({}, existingOrder), pedido), { productos: pedido.productos.map(function (apiProduct) {
                                    var _a;
                                    var existingProduct = existingProducts_1.find(function (p) { return p.Linea === apiProduct.Linea; });
                                    return __assign(__assign({}, apiProduct), { checkState: (_a = existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.checkState) !== null && _a !== void 0 ? _a : 'unchecked' });
                                }) });
                            if (existingOrder.status) {
                                mergedOrder.status = existingOrder.status;
                            }
                            if (!(0, lodash_1.isEqual)(existingOrder, mergedOrder)) {
                                updates_1[path] = mergedOrder;
                                updatedOrdersCount_1++;
                            }
                        }
                    });
                    firebaseOrderMap_1.forEach(function (order) {
                        var orderDate = new Date(order.originalDate);
                        var isAfterStartDate = orderDate >= sevenDaysAgo_1;
                        if (!apiOrderIds_1.has(order.id) && isAfterStartDate) {
                            var path = "allOrders/".concat(order.originalDate, "/").concat(order.id);
                            updates_1[path] = null;
                            deletedOrdersCount_1++;
                        }
                    });
                    if (!(Object.keys(updates_1).length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, database_1.update)((0, database_1.ref)(firebaseConfig_js_1.database), updates_1)];
                case 5:
                    _a.sent();
                    console.log("".concat(newOrdersCount_1, " nuevos pedidos generales a\u00F1adidos. ").concat(updatedOrdersCount_1, " pedidos existentes actualizados. ").concat(deletedOrdersCount_1, " pedidos eliminados."));
                    return [3 /*break*/, 7];
                case 6:
                    console.log('No se encontraron nuevos pedidos generales para añadir, actualizar o eliminar.');
                    _a.label = 7;
                case 7:
                    // --- PEDIDOS MERCADONA ---
                    console.log('\nProcesando pedidos de Mercadona para los últimos 7 días...');
                    _loop_1 = function (i) {
                        var processDate, fecha, mercadonaLinesData, pedidosMercadonaApi, mercadonaRef, snapshotMercadona, firebaseMercadonaData, mercadonaUpdates_1, newMercadonaCount_1, updatedMercadonaCount_1, deletedMercadonaCount_1, apiKeys_1, mercadonaRef, snapshot_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    processDate = new Date(today);
                                    processDate.setDate(today.getDate() - i);
                                    fecha = formatDate(processDate);
                                    console.log("Procesando Mercadona para fecha: ".concat(fecha));
                                    return [4 /*yield*/, getPedidosMercadona(token, fecha)];
                                case 1:
                                    mercadonaLinesData = _b.sent();
                                    if (!(mercadonaLinesData && mercadonaLinesData.length > 0)) return [3 /*break*/, 6];
                                    pedidosMercadonaApi = agruparPedidosMercadona(mercadonaLinesData);
                                    mercadonaRef = (0, database_1.ref)(firebaseConfig_js_1.database, "mercadona/".concat(fecha));
                                    return [4 /*yield*/, (0, database_1.get)(mercadonaRef)];
                                case 2:
                                    snapshotMercadona = _b.sent();
                                    firebaseMercadonaData = snapshotMercadona.val() || {};
                                    mercadonaUpdates_1 = {};
                                    newMercadonaCount_1 = 0;
                                    updatedMercadonaCount_1 = 0;
                                    deletedMercadonaCount_1 = 0;
                                    apiKeys_1 = new Set();
                                    pedidosMercadonaApi.forEach(function (pedidoApi) {
                                        var key = pedidoApi.plataforma.trim();
                                        apiKeys_1.add(key);
                                        var existingOrderData = firebaseMercadonaData[key];
                                        var path = "mercadona/".concat(fecha, "/").concat(key);
                                        if (!existingOrderData) {
                                            // Pedido nuevo
                                            var newOrder = __assign(__assign({}, pedidoApi), { isNew: true, productos: (pedidoApi.productos || []).map(function (p) { return (__assign(__assign({}, p), { checkState: 'unchecked', note: '' })); }) });
                                            mercadonaUpdates_1[path] = newOrder;
                                            newMercadonaCount_1++;
                                        }
                                        else {
                                            // Pedido existente, fusionar y comprobar cambios
                                            var mergedOrder = void 0;
                                            if (pedidoApi.plataforma === 'MICRO') {
                                                var newProductos = pedidoApi.productos.map(function (apiPlat) {
                                                    var platKey = "".concat(apiPlat.plataforma.trim(), "-").concat(apiPlat.numPedido);
                                                    var existingPlat = (existingOrderData.productos || []).find(function (p) { return "".concat(p.plataforma.trim(), "-").concat(p.numPedido) === platKey; }) || {};
                                                    var subProductosMap = new Map();
                                                    (existingPlat.subProductos || []).forEach(function (sub) { return subProductosMap.set(sub.linea, sub); });
                                                    var newSubProductos = apiPlat.subProductos.map(function (apiSub) {
                                                        var _a, _b, _c, _d;
                                                        var existingSub = subProductosMap.get(apiSub.linea);
                                                        return __assign(__assign({}, apiSub), { checkState: (_a = existingSub === null || existingSub === void 0 ? void 0 : existingSub.checkState) !== null && _a !== void 0 ? _a : 'unchecked', note: (_b = existingSub === null || existingSub === void 0 ? void 0 : existingSub.note) !== null && _b !== void 0 ? _b : '', variedad: (_c = existingSub === null || existingSub === void 0 ? void 0 : existingSub.variedad) !== null && _c !== void 0 ? _c : '', origen: (_d = existingSub === null || existingSub === void 0 ? void 0 : existingSub.origen) !== null && _d !== void 0 ? _d : '' });
                                                    });
                                                    return __assign(__assign({}, apiPlat), { subProductos: newSubProductos });
                                                });
                                                mergedOrder = __assign(__assign(__assign({}, existingOrderData), pedidoApi), { productos: newProductos });
                                                if (existingOrderData.status) {
                                                    mergedOrder.status = existingOrderData.status;
                                                }
                                            }
                                            else {
                                                // Lógica de fusión para pedidos normales de Mercadona
                                                var productosMap_1 = new Map();
                                                (existingOrderData.productos || []).forEach(function (p) { return productosMap_1.set(p.linea, p); });
                                                var newProductos = (pedidoApi.productos || []).map(function (apiProduct) {
                                                    var _a, _b, _c, _d;
                                                    var existingProduct = productosMap_1.get(apiProduct.linea);
                                                    return __assign(__assign({}, apiProduct), { checkState: (_a = existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.checkState) !== null && _a !== void 0 ? _a : 'unchecked', note: (_b = existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.note) !== null && _b !== void 0 ? _b : '', variedad: (_c = existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.variedad) !== null && _c !== void 0 ? _c : '', origen: (_d = existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.origen) !== null && _d !== void 0 ? _d : '' });
                                                });
                                                mergedOrder = __assign(__assign(__assign({}, existingOrderData), pedidoApi), { productos: newProductos });
                                                if (existingOrderData.status) {
                                                    mergedOrder.status = existingOrderData.status;
                                                }
                                            }
                                            if (!(0, lodash_1.isEqual)(existingOrderData, mergedOrder)) {
                                                mercadonaUpdates_1[path] = mergedOrder;
                                                updatedMercadonaCount_1++;
                                            }
                                        }
                                    });
                                    Object.keys(firebaseMercadonaData).forEach(function (key) {
                                        if (!apiKeys_1.has(key)) {
                                            mercadonaUpdates_1["mercadona/".concat(fecha, "/").concat(key)] = null;
                                            deletedMercadonaCount_1++;
                                        }
                                    });
                                    if (!(Object.keys(mercadonaUpdates_1).length > 0)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, (0, database_1.update)((0, database_1.ref)(firebaseConfig_js_1.database), mercadonaUpdates_1)];
                                case 3:
                                    _b.sent();
                                    console.log("Mercadona (".concat(fecha, "): ").concat(newMercadonaCount_1, " nuevos a\u00F1adidos, ").concat(updatedMercadonaCount_1, " actualizados, ").concat(deletedMercadonaCount_1, " eliminados."));
                                    return [3 /*break*/, 5];
                                case 4:
                                    console.log("Mercadona (".concat(fecha, "): Sin cambios."));
                                    _b.label = 5;
                                case 5: return [3 /*break*/, 9];
                                case 6:
                                    mercadonaRef = (0, database_1.ref)(firebaseConfig_js_1.database, "mercadona/".concat(fecha));
                                    return [4 /*yield*/, (0, database_1.get)(mercadonaRef)];
                                case 7:
                                    snapshot_1 = _b.sent();
                                    if (!snapshot_1.exists()) return [3 /*break*/, 9];
                                    return [4 /*yield*/, (0, database_1.remove)(mercadonaRef)];
                                case 8:
                                    _b.sent();
                                    console.log("Mercadona (".concat(fecha, "): Eliminados todos los pedidos de Firebase porque no se encontraron en la API."));
                                    _b.label = 9;
                                case 9: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 8;
                case 8:
                    if (!(i < 7)) return [3 /*break*/, 11];
                    return [5 /*yield**/, _loop_1(i)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 8];
                case 11:
                    // --- HORAS CARGA MERCADONA ---
                    console.log('\nProcesando horas de carga de Mercadona para los últimos días...');
                    i = -2;
                    _a.label = 12;
                case 12:
                    if (!(i < 3)) return [3 /*break*/, 17];
                    targetDate = new Date();
                    targetDate.setDate(today.getDate() - i);
                    formattedDate = formatDate(targetDate);
                    console.log("Obteniendo horas de carga para ".concat(formattedDate, "..."));
                    return [4 /*yield*/, getHorasCarga(token, targetDate)];
                case 13:
                    horasCargaData = _a.sent();
                    if (!(horasCargaData && horasCargaData.length > 0)) return [3 /*break*/, 15];
                    horasCargaRef = (0, database_1.ref)(firebaseConfig_js_1.database, "horasCargaMercadona/".concat(formattedDate));
                    return [4 /*yield*/, (0, database_1.set)(horasCargaRef, horasCargaData)];
                case 14:
                    _a.sent();
                    console.log("Horas de carga de Mercadona para ".concat(formattedDate, " guardadas en Firebase."));
                    return [3 /*break*/, 16];
                case 15:
                    console.log("No se encontraron horas de carga de Mercadona para ".concat(formattedDate, ", no se guardar\u00E1 nada."));
                    _a.label = 16;
                case 16:
                    i++;
                    return [3 /*break*/, 12];
                case 17:
                    // --- PRODUCTOS CLIENTE ---
                    console.log('\nProcesando productos de cliente...');
                    return [4 /*yield*/, getProductosCliente()];
                case 18:
                    productosCliente = _a.sent();
                    productosClienteRef = (0, database_1.ref)(firebaseConfig_js_1.database, 'productosCliente');
                    return [4 /*yield*/, (0, database_1.set)(productosClienteRef, productosCliente)];
                case 19:
                    _a.sent();
                    console.log('Productos de cliente guardados en Firebase.');
                    console.log('\nSubida de datos completada con éxito.');
                    return [3 /*break*/, 21];
                case 20:
                    error_7 = _a.sent();
                    if (error_7 instanceof Error) {
                        console.error('Error en el proceso principal:', error_7.message);
                    }
                    else {
                        console.error('Ocurrió un error desconocido en el proceso principal.');
                    }
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    });
}
// Descomenta la siguiente línea para ejecutar la función al correr el script
main();
