let phoneQuaternion = [0, 0, 0, 1];
let smoothQuaternion = [0, 0, 0, 1];

let websocket = null;

const startSensorLogging = () => {
  if (websocket) {
    websocket.close();
  }

  websocket = new WebSocket("ws://localhost:3000");

  websocket.onopen = () => {
    console.log("🟢 Підключено до сенсора");
  };

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data).payload[0].values;

      const { qx, qy, qz, qw } = data;
      phoneQuaternion = [qx, qy, qz, qw];
      update();
    } catch (e) {
      console.error("Помилка парсингу даних:", e);
    }
  };

  websocket.onerror = (error) => {
    console.error("🔴 Помилка з'єднання:", error);
  };

  websocket.onclose = () => {
    console.log("🟡 З'єднання закрито");
  };
};

startSensorLogging();

const sensorAPI = {
  reconnect: () => startSensorLogging(),
  disconnect: () => {
    if (websocket) {
      websocket.close();
    }
  },
};

// Для тестування з консолі браузера
window.sensorAPI = sensorAPI;
