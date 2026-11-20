/**
 * ClickCart Order Status Synchronization & Timeline End-to-End Test
 * Tests the complete customer & admin order synchronization lifecycle.
 */
const http = require('http');
const app = require('./app');

// Helper to execute requests against Express app
function request(server, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING CLICKCART ORDER STATUS SYNCHRONIZATION TESTS ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Authenticate Customer
    console.log('\n[1] Authenticating Customer...');
    const custLoginRes = await request(server, 'POST', '/api/auth/login', {}, {
      email: 'customer@clickcart.com',
      password: 'password123'
    });
    if (custLoginRes.status !== 200 || !custLoginRes.data.success) {
      throw new Error(`Customer login failed: ${JSON.stringify(custLoginRes.data)}`);
    }
    const customerToken = custLoginRes.data.token || custLoginRes.data.data?.token;
    console.log('✅ Customer authenticated successfully.');

    // 2. Authenticate Admin
    console.log('\n[2] Authenticating Admin...');
    const adminLoginRes = await request(server, 'POST', '/api/auth/login', {}, {
      email: 'admin@clickcart.com',
      password: 'admin123'
    });
    if (adminLoginRes.status !== 200 || !adminLoginRes.data.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.data)}`);
    }
    const adminToken = adminLoginRes.data.token || adminLoginRes.data.data?.token;
    console.log('✅ Admin authenticated successfully.');

    // 3. Customer places an order
    console.log('\n[3] Customer places an order...');
    const orderPayload = {
      customer: {
        name: 'Demo Customer',
        email: 'customer@clickcart.com',
        phone: '+91 98765 43210',
        address: 'Flat 402, Lotus Residency, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      items: [
        { productId: 1, quantity: 1 }
      ],
      payment_method: 'cod'
    };

    const placeRes = await request(server, 'POST', '/api/orders', {
      Authorization: `Bearer ${customerToken}`
    }, orderPayload);

    if (placeRes.status !== 201 || !placeRes.data.success) {
      throw new Error(`Order placement failed: ${JSON.stringify(placeRes.data)}`);
    }

    const createdOrder = placeRes.data.data;
    const orderId = createdOrder.id || createdOrder.order_id;
    const orderNumber = createdOrder.order_number;
    console.log(`✅ Order placed: ID=${orderId}, Number=${orderNumber}, Status=${createdOrder.order_status}`);
    if (createdOrder.order_status !== 'PLACED') {
      throw new Error(`Expected initial status PLACED, got: ${createdOrder.order_status}`);
    }

    // 4. Admin checks orders list
    console.log('\n[4] Admin views all orders...');
    const adminOrdersRes = await request(server, 'GET', '/api/orders', {
      Authorization: `Bearer ${adminToken}`
    });
    const foundInAdmin = adminOrdersRes.data.data.find(o => o.order_number === orderNumber || o.id === orderId);
    if (!foundInAdmin) {
      throw new Error(`Created order ${orderNumber} not found in admin order list`);
    }
    console.log(`✅ Admin retrieved order ${orderNumber}. Status: ${foundInAdmin.order_status}`);
    if (foundInAdmin.order_status !== 'PLACED') {
      throw new Error(`Expected admin order status PLACED, got: ${foundInAdmin.order_status}`);
    }

    // 5. Admin updates status from PLACED to PROCESSING
    console.log('\n[5] Admin updates status to PROCESSING...');
    const updateProcRes = await request(server, 'PUT', `/api/orders/${orderId}/status`, {
      Authorization: `Bearer ${adminToken}`
    }, { status: 'PROCESSING', note: 'Payment verified, preparing packaging' });

    if (updateProcRes.status !== 200 || !updateProcRes.data.success) {
      throw new Error(`Admin update to PROCESSING failed: ${JSON.stringify(updateProcRes.data)}`);
    }
    console.log(`✅ Admin updated order status: ${updateProcRes.data.data.order_status}`);
    if (updateProcRes.data.data.order_status !== 'PROCESSING') {
      throw new Error(`Expected updated status PROCESSING, got: ${updateProcRes.data.data.order_status}`);
    }

    // 6. Customer opens My Orders (GET /api/orders/my-orders) -> Must show PROCESSING
    console.log('\n[6] Customer opens My Orders...');
    const myOrdersProcRes = await request(server, 'GET', '/api/orders/my-orders', {
      Authorization: `Bearer ${customerToken}`
    });
    const custOrderProc = myOrdersProcRes.data.data.find(o => o.order_number === orderNumber || o.id === orderId);
    if (!custOrderProc) {
      throw new Error(`Order ${orderNumber} not found in customer my-orders list`);
    }
    console.log(`✅ Customer My Orders displays status: ${custOrderProc.order_status}`);
    if (custOrderProc.order_status !== 'PROCESSING') {
      throw new Error(`Expected Customer My Orders status PROCESSING, got: ${custOrderProc.order_status}`);
    }

    // 7. Customer opens Live Order Tracking (GET /api/orders/:id/track and GET /api/orders/:id)
    console.log('\n[7] Customer opens Live Order Tracking...');
    const trackProcRes = await request(server, 'GET', `/api/orders/${orderNumber}/track`, {
      Authorization: `Bearer ${customerToken}`
    });
    if (trackProcRes.status !== 200 || !trackProcRes.data.success) {
      throw new Error(`Customer trackOrder failed: ${JSON.stringify(trackProcRes.data)}`);
    }
    const trackedOrderProc = trackProcRes.data.data;
    console.log(`✅ Customer Live Order Tracking displays status: ${trackedOrderProc.order_status}`);
    if (trackedOrderProc.order_status !== 'PROCESSING') {
      throw new Error(`Expected Live Order Tracking status PROCESSING, got: ${trackedOrderProc.order_status}`);
    }
    console.log(`   Tracking history events count: ${trackedOrderProc.status_history?.length || 0}`);

    // 8. Admin updates status to SHIPPED (testing by order_number string identifier)
    console.log('\n[8] Admin updates status to SHIPPED (via order number)...');
    const updateShipRes = await request(server, 'PUT', `/api/orders/${orderNumber}/status`, {
      Authorization: `Bearer ${adminToken}`
    }, { status: 'SHIPPED', note: 'Dispatched via BlueDart Express' });

    if (updateShipRes.status !== 200 || !updateShipRes.data.success) {
      throw new Error(`Admin update to SHIPPED failed: ${JSON.stringify(updateShipRes.data)}`);
    }
    console.log(`✅ Admin updated order status: ${updateShipRes.data.data.order_status}`);
    if (updateShipRes.data.data.order_status !== 'SHIPPED') {
      throw new Error(`Expected updated status SHIPPED, got: ${updateShipRes.data.data.order_status}`);
    }

    // 9. Customer opens My Orders -> Immediately reflects SHIPPED
    console.log('\n[9] Customer opens My Orders...');
    const myOrdersShipRes = await request(server, 'GET', '/api/orders/my-orders', {
      Authorization: `Bearer ${customerToken}`
    });
    const custOrderShip = myOrdersShipRes.data.data.find(o => o.order_number === orderNumber || o.id === orderId);
    console.log(`✅ Customer My Orders immediately reflects status: ${custOrderShip.order_status}`);
    if (custOrderShip.order_status !== 'SHIPPED') {
      throw new Error(`Expected Customer My Orders status SHIPPED, got: ${custOrderShip.order_status}`);
    }

    // 10. Customer opens Live Order Tracking -> Immediately reflects SHIPPED
    console.log('\n[10] Customer opens Live Order Tracking...');
    const trackShipRes = await request(server, 'GET', `/api/orders/${orderId}/track`, {
      Authorization: `Bearer ${customerToken}`
    });
    const trackedOrderShip = trackShipRes.data.data;
    console.log(`✅ Customer Live Order Tracking immediately reflects status: ${trackedOrderShip.order_status}`);
    if (trackedOrderShip.order_status !== 'SHIPPED') {
      throw new Error(`Expected Live Order Tracking status SHIPPED, got: ${trackedOrderShip.order_status}`);
    }

    // 11. Refresh simulation: re-querying directly from database / API
    console.log('\n[11] Refresh simulation: fresh fetch of order...');
    const refreshRes = await request(server, 'GET', `/api/orders/${orderNumber}`, {
      Authorization: `Bearer ${customerToken}`
    });
    console.log(`✅ Refreshed order status remains: ${refreshRes.data.data.order_status}`);
    if (refreshRes.data.data.order_status !== 'SHIPPED') {
      throw new Error(`Expected refreshed status SHIPPED, got: ${refreshRes.data.data.order_status}`);
    }

    // 12. Verify status history audit trail
    console.log('\n[12] Verifying chronological audit trail...');
    const history = refreshRes.data.data.status_history || [];
    console.log(`   Total history stages recorded: ${history.length}`);
    history.forEach((h, i) => {
      console.log(`   Stage ${i + 1}: ${h.status} - "${h.note}" (${h.changed_by})`);
    });
    const hasPlaced = history.some(h => h.status === 'PLACED');
    const hasProcessing = history.some(h => h.status === 'PROCESSING');
    const hasShipped = history.some(h => h.status === 'SHIPPED');
    if (!hasPlaced || !hasProcessing || !hasShipped) {
      throw new Error('Missing expected stages in status_history!');
    }
    console.log('✅ Status history audit trail verified.');

    // 13. Verify timeline normalization logic on edge cases
    console.log('\n[13] Verifying timeline status normalization against edge cases...');
    const { normalizeOrderStatus } = require('./controllers/orderController');
    const testCases = [
      { input: 'Shipped', expected: 'SHIPPED' },
      { input: 'shipped', expected: 'SHIPPED' },
      { input: 'SHIPPED', expected: 'SHIPPED' },
      { input: 'Order Placed', expected: 'PLACED' },
      { input: 'order_placed', expected: 'PLACED' },
      { input: 'PLACED', expected: 'PLACED' },
      { input: 'Processing', expected: 'PROCESSING' },
      { input: 'processing', expected: 'PROCESSING' },
      { input: 'Out for Delivery', expected: 'OUT_FOR_DELIVERY' },
      { input: 'out_for_delivery', expected: 'OUT_FOR_DELIVERY' },
      { input: 'Delivered', expected: 'DELIVERED' },
      { input: 'Cancelled', expected: 'CANCELLED' },
      { input: 'Return Requested', expected: 'RETURN_REQUESTED' },
      { input: 'Returned', expected: 'RETURNED' },
      { input: 'Refunded', expected: 'REFUNDED' }
    ];

    for (const tc of testCases) {
      const res = normalizeOrderStatus(tc.input);
      if (res !== tc.expected) {
        throw new Error(`Normalization failed for '${tc.input}': expected '${tc.expected}', got '${res}'`);
      }
    }
    console.log(`✅ All ${testCases.length} status normalization test cases passed.`);

    console.log('\n======================================================');
    console.log('🎉 ALL ORDER STATUS SYNCHRONIZATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
    process.exit(0);
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
