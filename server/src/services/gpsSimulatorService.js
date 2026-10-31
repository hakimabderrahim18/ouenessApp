const Truck = require('../models/Truck');
const Shipment = require('../models/Shipment');
const { emitNotification } = require('./notificationService');
const { logAudit } = require('./auditService');

let simulatorInterval = null;
let simulationStep = 0;

const startGpsSimulator = (app) => {
  if (simulatorInterval) return;

  console.log('[GPS Simulator] 🛰️ Live Algerian GPS Simulator Started...');

  simulatorInterval = setInterval(async () => {
    simulationStep++;
    const io = app.get('io');

    try {
      // Find all in-transit or delayed shipments
      const activeShipments = await Shipment.find({
        status: { $in: ['IN_TRANSIT', 'DELAYED'] },
      }).populate('truck driver originWarehouse');

      const now = new Date();

      for (const shipment of activeShipments) {
        // 1. Check if ETA exceeded => auto-flag as DELAYED
        if (now > new Date(shipment.estimatedArrivalTime) && shipment.status !== 'DELAYED') {
          shipment.status = 'DELAYED';
          shipment.statusHistory.push({
            status: 'DELAYED',
            timestamp: now,
            notes: 'تم تصنيف الشحنة متأخرة آلياً لتجاوز توقيت الوصول المحدد (ETA)',
            location: shipment.currentLocation,
          });
          await shipment.save();

          await emitNotification(app, {
            title: {
              ar: `⚠️ تأخر شحنة في الطريق: (${shipment.reference})`,
              fr: `⚠️ Retard de livraison: (${shipment.reference})`,
              en: `⚠️ Delivery Delayed: (${shipment.reference})`,
            },
            message: {
              ar: `تجاوزت الشحنة (${shipment.reference}) المتجهة إلى (${shipment.destination.city}) وقت الوصول المقدر. الشاحنة: ${shipment.truck?.plateNumber}.`,
              fr: `L'expédition (${shipment.reference}) vers (${shipment.destination.city}) a dépassé son heure d'arrivée estimée.`,
              en: `Shipment (${shipment.reference}) to (${shipment.destination.city}) has exceeded its estimated arrival time.`,
            },
            category: 'WARNING',
            priority: 'HIGH',
            targetType: 'ALL',
            metadata: { shipmentId: shipment._id },
          });

          if (io) io.emit('shipment_delayed', shipment);
        }

        // 2. Move truck along waypoints
        const waypoints = shipment.routeWaypoints || [];
        if (waypoints.length > 1) {
          const currentIndex = simulationStep % waypoints.length;
          const nextIndex = (currentIndex + 1) % waypoints.length;
          const currentPoint = waypoints[currentIndex];
          const nextPoint = waypoints[nextIndex];

          // Calculate approximate heading angle
          const heading = Math.round(
            (Math.atan2(nextPoint.lng - currentPoint.lng, nextPoint.lat - currentPoint.lat) * 180) / Math.PI + 360
          ) % 360;

          const updatedPosition = {
            lat: currentPoint.lat,
            lng: currentPoint.lng,
            speedKmH: Math.floor(65 + Math.random() * 12),
            headingDeg: heading,
            lastUpdated: new Date(),
          };

          // Update shipment location
          shipment.currentLocation = updatedPosition;
          await shipment.save();

          // Update truck location
          if (shipment.truck) {
            await Truck.findByIdAndUpdate(shipment.truck._id, {
              currentLocation: updatedPosition,
              status: 'in_transit',
            });
          }

          // Emit live telemetry to all connected clients
          if (io) {
            io.emit('truck_position_update', {
              shipmentId: shipment._id,
              reference: shipment.reference,
              truckId: shipment.truck?._id,
              plateNumber: shipment.truck?.plateNumber,
              driverName: shipment.driver?.fullName,
              location: updatedPosition,
              status: shipment.status,
              destination: shipment.destination,
              telemetry: {
                tankTemperatureC: Number((22.0 + Math.random() * 2.5).toFixed(1)),
                tankPressureBar: Number((1.02 + Math.random() * 0.05).toFixed(2)),
              },
            });
          }
        }
      }
    } catch (err) {
      console.error('[GPS Simulator Error]', err.message);
    }
  }, 4000); // Pulse every 4 seconds for a dynamic real-time demo
};

const stopGpsSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log('[GPS Simulator] 🛑 Simulator Stopped.');
  }
};

const getSimulatorStatus = () => {
  return { isRunning: !!simulatorInterval, step: simulationStep };
};

module.exports = {
  startGpsSimulator,
  stopGpsSimulator,
  getSimulatorStatus,
};
