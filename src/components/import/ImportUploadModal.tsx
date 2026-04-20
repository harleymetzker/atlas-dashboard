import { useRef, useState } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { parseOFX, parseCSV, applyCSVMapping } from '../../lib/parseExtrato'
import type { RawRow } from '../../lib/parseExtrato'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

interface ImportUploadModalProps {
  open: boolean
  onClose: () => void
  onParsed: (rows: RawRow[]) => void
}

type Step = 'upload' | 'mapping'

export function ImportUploadModal({ open, onClose, onParsed }: ImportUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  // CSV mapping state
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRawRows, setCsvRawRows] = useState<Record<string, string>[]>([])
  const [mapDate, setMapDate] = useState('')
  const [mapDesc, setMapDesc] = useState('')
  const [mapAmount, setMapAmount] = useState('')

  function reset() {
    setStep('upload')
    setError('')
    setFileName('')
    setCsvHeaders([])
    setCsvRawRows([])
    setMapDate('')
    setMapDesc('')
    setMapAmount('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function processFile(file: File) {
    setError('')
    setFileName(file.name)

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'ofx' && ext !== 'csv' && ext !== 'txt') {
      setError('Formato não suportado. Use arquivos .ofx ou .csv')
      return
    }

    const text = await file.text()

    if (ext === 'ofx' || ext === 'txt' || text.includes('<STMTTRN>') || text.includes('<stmttrn>')) {
      const rows = parseOFX(text)
      if (rows.length === 0) {
        setError('Nenhuma transação encontrada no arquivo OFX.')
        return
      }
      reset()
      onParsed(rows)
    } else {
      const result = parseCSV(text)
      if (!result.needsMapping) {
        if (result.rows.length === 0) {
          setError('Nenhuma transação encontrada no arquivo CSV.')
          return
        }
        reset()
        onParsed(result.rows)
      } else {
        // Need manual column mapping
        setCsvHeaders(result.headers)
        setCsvRawRows(result.rows)
        setMapDate(result.headers[0] ?? '')
        setMapDesc(result.headers[1] ?? '')
        setMapAmount(result.headers[2] ?? '')
        setStep('mapping')
      }
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function applyMapping() {
    if (!mapDate || !mapDesc || !mapAmount) {
      setError('Selecione as três colunas para continuar.')
      return
    }
    const rows = applyCSVMapping(csvRawRows, { dateCol: mapDate, descCol: mapDesc, amountCol: mapAmount })
    if (rows.length === 0) {
      setError('Nenhuma linha válida após o mapeamento. Verifique as colunas selecionadas.')
      return
    }
    reset()
    onParsed(rows)
  }

  const headerOptions = csvHeaders.map(h => ({ value: h, label: h }))

  return (
    <Modal open={open} onClose={handleClose} title="Importar Extrato Bancário">
      {step === 'upload' ? (
        <div className="space-y-4">
          <p className="text-sm text-white/50">
            Importe seu extrato nos formatos <strong className="text-white/70">OFX</strong> ou <strong className="text-white/70">CSV</strong>.
            Após a importação, você poderá categorizar cada transação antes de salvar.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-brand-green bg-brand-green/5'
                : 'border-white/15 hover:border-white/30 hover:bg-white/3'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".ofx,.csv,.txt"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <Upload size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-sm text-white/60">
              Arraste o arquivo aqui ou <span className="text-white underline">clique para selecionar</span>
            </p>
            <p className="text-xs text-white/30 mt-1">.ofx / .csv</p>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl text-sm text-white/60">
              <FileText size={14} />
              <span className="flex-1 truncate">{fileName}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Column mapping step */
        <div className="space-y-5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl text-sm text-white/60">
            <FileText size={14} />
            <span className="flex-1 truncate">{fileName}</span>
            <button onClick={reset} className="text-white/40 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <p className="text-sm text-white/50">
            Não foi possível detectar as colunas automaticamente. Selecione quais colunas correspondem a cada campo:
          </p>

          <Select
            label="Coluna de Data"
            value={mapDate}
            onChange={e => setMapDate(e.target.value)}
            options={headerOptions}
          />
          <Select
            label="Coluna de Descrição"
            value={mapDesc}
            onChange={e => setMapDesc(e.target.value)}
            options={headerOptions}
          />
          <Select
            label="Coluna de Valor"
            value={mapAmount}
            onChange={e => setMapAmount(e.target.value)}
            options={headerOptions}
          />

          {/* Preview first 3 rows */}
          {csvRawRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs text-white/60">
                <thead>
                  <tr className="border-b border-white/10">
                    {csvHeaders.map(h => (
                      <th key={h} className="px-3 py-2 text-left text-white/40 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRawRows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {csvHeaders.map(h => (
                        <td key={h} className="px-3 py-1.5 truncate max-w-[120px]">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={reset} className="flex-1">Voltar</Button>
            <Button onClick={applyMapping} className="flex-1">Confirmar Colunas</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
