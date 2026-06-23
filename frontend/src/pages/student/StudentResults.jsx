import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import api from '../../api/axios';

export default function StudentResults() {
  const { t } = useTranslation();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [routine, setRoutine] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const userRes = await api.get('/me/');
      const stuRes = await api.get('/students/');
      const myStudentProfile = stuRes.data.find(s => s.name === userRes.data.name) || stuRes.data[0];
      setStudent(myStudentProfile);
      const [examRes, gradeRes] = await Promise.all([api.get('/exams/'), api.get('/exams/grades/')]);
      const myExams = examRes.data.filter(e => e.class_level === myStudentProfile?.class_level);
      setExams(myExams);
      setGrades(gradeRes.data.sort((a, b) => b.gpa_value - a.gpa_value));
    } catch (error) { console.error("Error fetching initial data", error); }
  };

  const fetchExamDetails = async (examId) => {
    if (!examId || !student) return;
    setIsLoading(true);
    try {
      const [subExamRes, resultRes] = await Promise.all([api.get('/exams/subject-exams/'), api.get('/exams/results/')]);
      const examRoutine = subExamRes.data.filter(se => se.exam.toString() === examId.toString());
      examRoutine.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
      setRoutine(examRoutine);
      const myResults = resultRes.data.filter(r => r.exam.toString() === examId.toString() && r.student === student.id);
      setResults(myResults);
    } catch (error) { console.error("Error fetching exam details", error); }
    finally { setIsLoading(false); }
  };

  const handleExamChange = (e) => {
    const val = e.target.value;
    setSelectedExamId(val);
    if (val) { fetchExamDetails(val); } else { setRoutine([]); setResults([]); }
  };

  const selectedExamObj = exams.find(e => e.id.toString() === selectedExamId);
  const getSubjectResult = (subjectId) => results.find(r => r.subject === subjectId);

  const calculateFinal = () => {
    if (results.length === 0) return null;
    let totalMarks = 0, totalGpa = 0, hasFailed = false;
    results.forEach(r => {
      totalMarks += Number(r.marks_obtained);
      const gradeObj = grades.find(g => g.id === r.grade);
      const gpa = gradeObj ? Number(gradeObj.gpa_value) : 0;
      totalGpa += gpa;
      if (gpa === 0) hasFailed = true;
    });
    if (results.length < routine.length) return { total: totalMarks, gpa: 0, grade: 'Incomplete' };
    if (hasFailed) return { total: totalMarks, gpa: 0, grade: 'F' };
    const avgGpa = (totalGpa / routine.length).toFixed(2);
    const finalGradeObj = grades.find(g => Number(g.gpa_value) <= Number(avgGpa)) || { name: 'F' };
    return { total: totalMarks, gpa: avgGpa, grade: finalGradeObj.name };
  };

  const finalRes = calculateFinal();

  const handlePrintAdmitCard = async () => {
    if (!selectedExamId || !student) return;
    try { const response = await api.get(`/exams/admit-cards/pdf/${selectedExamId}/`, { responseType: 'blob' }); window.open(window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })), '_blank'); } catch (error) { alert("Failed to generate admit card PDF."); }
  };

  const handlePrintMarksheet = async () => {
    if (!selectedExamId || !student) return;
    try { const response = await api.get(`/exams/marksheet/pdf/${selectedExamId}/${student.student_id}/`, { responseType: 'blob' }); window.open(window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })), '_blank'); } catch (error) { alert("Failed to generate marksheet PDF."); }
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">{t('student.my_exams')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('student.exam_desc')}</p>
        </div>
        <div className="flex gap-3">
          {selectedExamId && routine.length > 0 && (
            <button onClick={handlePrintAdmitCard} className="bg-brand-tealCyan text-brand-deepPlum font-bold px-6 py-2.5 rounded-xl hover:bg-[#4bc2ab] transition-colors flex items-center gap-2 shadow-sm"><span>🖨️</span> {t('student.print_admit_card')}</button>
          )}
          {selectedExamId && results.length > 0 && (
            <button onClick={handlePrintMarksheet} className="bg-brand-royalPurple text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#6B3FA0] transition-colors flex items-center gap-2 shadow-sm"><span>📄</span> {t('student.print_marksheet')}</button>
          )}
        </div>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('student.select_exam')}</label>
          <select value={selectedExamId} onChange={handleExamChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors">
            <option value="">{t('student.choose_exam')}</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 font-bold text-gray-500 print:hidden">{t('student.loading_data')}</div>
      ) : selectedExamId && routine.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-2 print:border-gray-800 print:rounded-none">
            <div className="p-6 border-b-2 border-brand-deepPlum print:border-gray-800 bg-[#F5F0FF] print:bg-transparent text-center relative">
              <div className="absolute top-6 right-6 hidden print:block"><QRCode value={`Verify | ID: ${student?.student_id} | Exam: ${selectedExamObj?.name}`} size={60} level="L" /></div>
              <div className="w-12 h-12 bg-brand-royalPurple print:bg-white print:border-2 print:border-gray-800 print:text-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow-sm">DIA</div>
              <h2 className="text-xl font-bold text-brand-deepPlum uppercase tracking-widest print:text-gray-900">{t('dashboard.ideal_academy')}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t('student.routine_title')}</p>
              <h3 className="text-md font-bold text-brand-royalPurple print:text-gray-700">{selectedExamObj?.name}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><span className="text-gray-500 font-semibold block text-xs">{t('student.student_name')}</span><span className="font-bold text-gray-800">{student?.name}</span></div>
                <div><span className="text-gray-500 font-semibold block text-xs">{t('student.student_id')}</span><span className="font-bold text-gray-800">{student?.student_id}</span></div>
                <div><span className="text-gray-500 font-semibold block text-xs">{t('student.class_section')}</span><span className="font-bold text-gray-800">{selectedExamObj?.class_level_name} - {student?.section_name || 'A'}</span></div>
                <div><span className="text-gray-500 font-semibold block text-xs">{t('admin.roll_number')}</span><span className="font-bold text-brand-tealCyan">{student?.roll_number}</span></div>
              </div>
              <h4 className="font-bold text-brand-deepPlum mb-3 border-b pb-2 text-sm uppercase">{t('student.exam_schedule')}</h4>
              <table className="w-full text-left border-collapse text-sm">
                <thead><tr className="bg-gray-50 text-gray-600"><th className="p-2 border border-gray-200">{t('common.date')}</th><th className="p-2 border border-gray-200">{t('common.subject')}</th><th className="p-2 border border-gray-200">{t('common.time')}</th></tr></thead>
                <tbody>{routine.map((sub) => (<tr key={sub.id}><td className="p-2 border border-gray-200 font-semibold">{new Date(sub.exam_date).toLocaleDateString('en-GB')}</td><td className="p-2 border border-gray-200 font-bold text-brand-deepPlum">{sub.subject_name}</td><td className="p-2 border border-gray-200 text-gray-600">{sub.exam_time.substring(0, 5)}</td></tr>))}</tbody>
              </table>
              <div className="hidden print:flex justify-between items-end mt-16 pt-4"><div className="text-center w-32 border-t border-gray-800"><p className="text-[10px] font-bold mt-1">Class Teacher</p></div><div className="text-center w-32 border-t border-gray-800"><p className="text-[10px] font-bold mt-1">Headmaster</p></div></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
            <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]"><h2 className="text-lg font-bold text-brand-deepPlum">{t('student.performance')}</h2></div>
            <div className="p-6">
              {results.length === 0 ? (<div className="text-center py-10"><span className="text-4xl block mb-3">🕒</span><p className="text-gray-500 font-semibold">{t('student.not_published')}</p></div>) : (
                <>
                  <table className="w-full text-left border-collapse text-sm mb-6">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 border-b border-gray-200">{t('common.subject')}</th><th className="p-3 border-b border-gray-200 text-center">{t('common.amount')}</th><th className="p-3 border-b border-gray-200 text-center">{t('common.type')}</th></tr></thead>
                    <tbody>{routine.map((sub) => { const res = getSubjectResult(sub.subject); const gradeObj = res ? grades.find(g => g.id === res.grade) : null; return (<tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-3 font-bold text-gray-800">{sub.subject_name}</td><td className="p-3 text-center font-bold text-brand-deepPlum">{res ? res.marks_obtained : '-'}</td><td className="p-3 text-center font-bold text-brand-tealCyan">{gradeObj ? gradeObj.name : '-'}</td></tr>); })}</tbody>
                  </table>
                  {finalRes && (<div className="bg-brand-deepPlum text-white p-4 rounded-xl flex justify-between items-center shadow-md"><div><p className="text-xs text-brand-softLavender font-semibold uppercase tracking-wider mb-1">{t('student.final_result')}</p><p className="text-sm font-medium">{t('student.total_marks')}: <span className="font-bold">{finalRes.total}</span></p></div><div className="text-right"><p className="text-xs text-brand-softLavender font-semibold uppercase tracking-wider mb-1">{t('student.gpa_grade')}</p><p className="text-2xl font-bold text-brand-tealCyan">{finalRes.gpa} <span className="text-white text-lg">({finalRes.grade})</span></p></div></div>)}
                </>
              )}
            </div>
          </motion.div>
        </div>
      ) : selectedExamId ? (<div className="text-center py-10 font-bold text-gray-400 border rounded-xl bg-white print:hidden">{t('student.no_routine_available')}</div>) : null}
    </div>
  );
}