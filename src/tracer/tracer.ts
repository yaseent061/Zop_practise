import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';

const init = ()=>{
    const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({
            url : "http://otel-collector:4318/v1/traces",
            headers: {},
          }),
        metricReader: new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            headers: {}, 
            concurrencyLimit: 1, 
          }),
        }),
        instrumentations: [getNodeAutoInstrumentations()],
        });
        sdk.start();
}

export default init;