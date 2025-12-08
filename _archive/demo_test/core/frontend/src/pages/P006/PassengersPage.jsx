import React, { useEffect, useState } from 'react'
import api from '../../services/api'

const certOptions = ['身份证']
const typeOptions = ['成人','儿童','学生']

const PassengersPage = () => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name:'', cert_type:'身份证', id_number:'', phone:'', passenger_type:'成人', is_default:false })
  const [editing, setEditing] = useState(null)

  const fetchList = async () => {
    try {
      setLoading(true)
      const res = await api.get('/passengers')
      const data = res?.data || {}
      setList(data.passengers || [])
    } catch (e) { setError('获取乘车人失败') } finally { setLoading(false) }
  }
  useEffect(()=>{ fetchList() },[])

  const resetForm = () => setForm({ name:'', cert_type:'身份证', id_number:'', phone:'', passenger_type:'成人', is_default:false })

  const submit = async () => {
    setError('')
    try {
      if (!form.name || !form.id_number || !form.phone) { setError('姓名、证件号码、手机号为必填'); return }
      if (editing) {
        await api.put(`/passengers/${editing}`, form)
      } else {
        await api.post('/passengers', form)
      }
      resetForm(); setEditing(null); fetchList()
    } catch (e) { setError(typeof e === 'string' ? e : '保存失败') }
  }

  const remove = async (id) => { try { await api.delete(`/passengers/${id}`); fetchList() } catch (e) { setError('删除失败') } }
  const setDefault = async (id) => { try { await api.post(`/passengers/${id}/default`); fetchList() } catch (e) { setError('设置默认失败') } }

  return (
    <div>
      <h2>常用乘车人管理</h2>
      {error && <div style={{ color:'#ff4d4f' }}>{error}</div>}
      <div style={{ margin:'10px 0', border:'1px solid #eee', padding:10 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <input placeholder="姓名" value={form.name} onChange={e=>setForm({ ...form, name:e.target.value })} />
          <select value={form.cert_type} onChange={e=>setForm({ ...form, cert_type:e.target.value })}>{certOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
          <input placeholder="证件号码" value={form.id_number} onChange={e=>setForm({ ...form, id_number:e.target.value })} />
          <input placeholder="手机号" value={form.phone} onChange={e=>setForm({ ...form, phone:e.target.value })} />
          <select value={form.passenger_type} onChange={e=>setForm({ ...form, passenger_type:e.target.value })}>{typeOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
          <label><input type="checkbox" checked={form.is_default} onChange={e=>setForm({ ...form, is_default:e.target.checked })} /> 设为默认</label>
          <button className="submit-btn" onClick={submit}>{editing ? '保存' : '新增'}</button>
          {editing && <button className="submit-btn" onClick={()=>{ setEditing(null); resetForm() }}>取消编辑</button>}
        </div>
      </div>

      {loading ? <div>加载中…</div> : (
        <div>
          {list.length === 0 ? <div>暂无常用乘车人</div> : (
            <div>
              {list.map(p => (
                <div key={p.id} style={{ border:'1px solid #eee', marginBottom:10, padding:10, display:'flex', justifyContent:'space-between' }}>
                  <div>
                    <div><strong>{p.name}</strong> {p.is_default ? <span style={{ color:'#0077FF', marginLeft:6 }}>[默认]</span> : null}</div>
                    <div>{p.cert_type}：{p.id_number}</div>
                    {p.phone ? <div>手机号：{p.phone}</div> : null}
                    <div>旅客类型：{p.passenger_type}</div>
                  </div>
                  <div>
                    <button className="action-btn secondary" onClick={()=>{ setEditing(p.id); setForm({ name:p.name, cert_type:p.cert_type, id_number:p.id_number, phone:p.phone||'', passenger_type:p.passenger_type||'成人', is_default: !!p.is_default }) }}>编辑</button>
                    <button className="action-btn danger" onClick={()=>remove(p.id)} style={{ marginLeft:8 }}>删除</button>
                    <button className="action-btn primary" onClick={()=>setDefault(p.id)} style={{ marginLeft:8 }}>设为默认</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PassengersPage
