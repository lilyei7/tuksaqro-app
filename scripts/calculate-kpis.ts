#!/usr/bin/env node

/**
 * Script para calcular KPIs de todos los agentes
 * Se puede ejecutar manualmente o configurar como cron job diario
 *
 * Uso:
 * npm run calculate-kpis
 * o
 * node scripts/calculate-kpis.js
 */

import { calculateAllAgentsKPIs } from "@/lib/kpi/calculator"

async function main() {
  try {
    console.log("🚀 Iniciando cálculo de KPIs para todos los agentes...")
    console.log(`📅 Fecha: ${new Date().toISOString()}`)

    const startTime = Date.now()
    await calculateAllAgentsKPIs()
    const endTime = Date.now()

    console.log(`✅ Cálculo completado en ${(endTime - startTime) / 1000} segundos`)
    process.exit(0)
  } catch (error) {
    console.error("❌ Error calculando KPIs:", error)
    process.exit(1)
  }
}

main()