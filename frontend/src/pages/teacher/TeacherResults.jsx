import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function TeacherResults() {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marksData, setMarksData] = useState({});
  const [existingResultsMap, setExistingResultsMap] = useState({});
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [examRes, classRes, subRes, resultRes] = await Promise.all([
          api.get('/exams/'), api.get('/academics/classes/'), api.get('/academics/subjects/'), api.get('/exams/results/')
        ]);
        setExams(examRes.data); setClasses(classRes.data); setSubjects(subRes.data); setResults(resultRes.data);
      } catch (error) { console.error("Error fetching data:", error); }
    };
    fetchDropdownData();
  }, []);

  const handleFetchStudents = async (e) => {
    e.preventDefault();
    if (!selectedExam || !selectedClass || !selectedSubject) { setMsg({ type: 'error', text: t('teacher.select_all_fields') }); return; }
    setIsLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await api.get('/students/', { params: { class_level: selectedClass } });
      const fetchedStudents = res.data; setStudents(fetchedStudents);
      const filteredRes = results.filter(r => r.exam.toString() === selectedExam && r.subject.toString() === selectedSubject);
      const initialMarks = {}, existMap = {};
      filteredRes.forEach(r => { if (r.marks_obtained != null) { initialMarks[r.student] = r.marks_obtained; existMap[r.student] = r.id; } });
      setMarksData(initialMarks); setExistingResultsMap(existMap);
      if (fetchedStudents.length === 0) { setMsg({ type: 'error', text: t('teacher.no_students_class') }); }
      else if (Object.keys(existMap).length > 0) { setMsg({ type: 'success', text: t('teacher.existing_marks_loaded').replace('{count}', Object.keys(existMap).length) }); setTimeout(() => setMsg({ type: '', text: '' }), 4000); }
    } catch (error) { setMsg({ type: 'error', text: t('teacher.fetch_failed') }); }
    finally { setIsLoading(false); }
  };

  const handleMarksChange = (studentId, value) => { setMarksData(prev => ({ ...prev, [studentId]: value })); };

  const handleSaveMarks = async () => {
    setIsLoading(true); setMsg({ type: '', text: '' });
    try {
      const studentIdsWithMarks = Object.keys(marksData).filter(id => marksData[id] !== '');
      if (studentIdsWithMarks.length === 0) { setMsg({ type: 'error', text: t('teacher.enter_marks') }); setIsLoading(false); return; }
      for (const studentId of studentIdsWithMarks) {
        const val = marksData[studentId]; const existingResultId = existingResultsMap[studentId];
        if (existingResultId) { await api.patch(`/exams/results/${existingResultId}/`, { marks_obtained: val }); }
        else { await api.post('/exams/results/', { student: studentId, exam: selectedExam, subject: selectedSubject, marks_obtained: val }); }
      }
      const updatedResultsRes = await api.get('/exams/results/'); setResults(updatedResultsRes.data);
      setMsg({ type: 'success', text: t('teacher.marks_saved').replace('{count}', studentIdsWithMarks.length) });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } catch (error) { setMsg({ type: 'error', text: t('teacher.marks_save_failed') }); }
    finally { setIsLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">{t('teacher.my_results')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('teacher.results_desc')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleFetchStudents} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.subject')}</label><select required value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className={inputClass}><option value="">{t('teacher.select_exam')}</option>{exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('teacher.class_label')}</label><select required value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={inputClass}><option value="">{t('teacher.select_class')}</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('teacher.subject_label')}</label><select required value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={inputClass}><option value="">{t('teacher.select_subject')}</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors h-[42px]">{isLoading ? t('teacher.loading_students') : t('teacher.fetch_students')}</button>
        </form>
      </motion.div>

      {msg.text && (<div className={`p-4 rounded-xl font-semibold text-sm ${msg.type === 'success' ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>)}

      {students.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-[#F5F0FF] border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-brand-deepPlum">{t('teacher.student_list')}</h2>
            <span className="text-xs font-bold text-brand-royalPurple bg-white px-3 py-1 rounded-full border border-brand-softLavender/30">{t('common.total')}: {students.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 text-gray-500 text-sm"><th className="p-4 font-semibold border-b border-gray-100 w-24">{t('teacher.roll')}</th><th className="p-4 font-semibold border-b border-gray-100">{t('teacher.student_name_col')}</th><th className="p-4 font-semibold border-b border-gray-100 text-right w-48">{t('teacher.marks_obtained')}</th></tr></thead>
              <tbody>{students.map((student) => (<tr key={student.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors"><td className="p-4 font-bold text-brand-tealCyan">{student.roll_number}</td><td className="p-4 font-bold text-gray-700">{student.name}</td><td className="p-4 text-right"><input type="number" step="0.01" min="0" placeholder="0.00" value={marksData[student.id] || ''} onChange={(e) => handleMarksChange(student.id, e.target.value)} className="w-24 px-3 py-2 text-right rounded-lg border border-gray-200 focus:outline-none focus:border-brand-tealCyan font-bold text-brand-deepPlum bg-white shadow-sm" /></td></tr>))}</tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button onClick={handleSaveMarks} disabled={isLoading} className={`px-8 py-3 rounded-xl font-bold text-brand-deepPlum shadow-md transition-colors ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>{isLoading ? t('teacher.saving_marks') : t('teacher.save_marks')}</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}