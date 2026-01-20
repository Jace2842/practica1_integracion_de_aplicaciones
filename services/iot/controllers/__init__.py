"""CONTROLLERS - Lógica de negocio"""
from dateutil import parser as date_parser

class SensorController:
    @staticmethod
    def get_all(data, tipo=None, ubicacionId=None, validator=None):
        filtered = data['sensores']
        if tipo:
            filtered = [s for s in filtered if s.get('tipo') == tipo]
        if ubicacionId:
            filtered = [s for s in filtered if s.get('ubicacionId') == ubicacionId]
        for sensor in filtered:
            if not validator.validate_sensor(sensor):
                return {'error': 'Datos no conformes con el schema', 'status': 500}
        return {"data": filtered}

    @staticmethod
    def get_by_id(data, sensor_id, validator):
        sensor = next((s for s in data['sensores'] if s['id'] == sensor_id), None)
        if not sensor:
            return {'error': 'Sensor no encontrado', 'status': 404}
        if not validator.validate_sensor(sensor):
            return {'error': 'Datos no conformes con el schema', 'status': 500}
        return sensor

class LecturaController:
    @staticmethod
    def get_all(data, sensorId=None, ubicacionId=None, from_date=None, to_date=None, limit=100, validator=None):
        filtered = data['lecturas']
        if sensorId:
            filtered = [l for l in filtered if l.get('sensorId') == sensorId]
        if ubicacionId:
            filtered = [l for l in filtered if l.get('ubicacionId') == ubicacionId]
        
        from_dt = None
        to_dt = None
        
        if from_date:
            try:
                from_dt = date_parser.isoparse(from_date)
            except ValueError:
                return {'error': "Formato de fecha 'from' inválido. Use ISO 8601", 'status': 400}
        
        if to_date:
            try:
                to_dt = date_parser.isoparse(to_date)
            except ValueError:
                return {'error': "Formato de fecha 'to' inválido. Use ISO 8601", 'status': 400}
        
        if from_dt and to_dt and from_dt > to_dt:
            return {'error': "La fecha 'from' debe ser anterior a 'to'", 'status': 400}
        
        if from_dt or to_dt:
            date_filtered = []
            for lectura in filtered:
                timestamp_str = lectura.get('timestamp')
                if timestamp_str:
                    timestamp = date_parser.isoparse(timestamp_str)
                    if from_dt and timestamp < from_dt:
                        continue
                    if to_dt and timestamp > to_dt:
                        continue
                    date_filtered.append(lectura)
            filtered = date_filtered
        
        filtered = filtered[:limit]
        for lectura in filtered:
            if not validator.validate_lectura(lectura):
                return {'error': 'Datos no conformes con el schema', 'status': 500}
        
        return {"total": len(filtered), "limit": limit, "data": filtered}

class VehiculoController:
    @staticmethod
    def get_all(data, validator):
        for vehiculo in data['vehiculos']:
            if not validator.validate_vehiculo(vehiculo):
                return {'error': 'Datos no conformes con el schema', 'status': 500}
        return {"data": data['vehiculos']}

    @staticmethod
    def get_by_id(data, vehiculo_id, validator):
        vehiculo = next((v for v in data['vehiculos'] if v['id'] == vehiculo_id), None)
        if not vehiculo:
            return {'error': 'Vehículo no encontrado', 'status': 404}
        if not validator.validate_vehiculo(vehiculo):
            return {'error': 'Datos no conformes con el schema', 'status': 500}
        return vehiculo
