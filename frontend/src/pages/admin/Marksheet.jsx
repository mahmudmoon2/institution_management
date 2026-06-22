import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function Marksheet() {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [student, setStudent] = useState(null);
  const [marksData, setMarksData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, gpa: 0, grade: '-' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [examId, studentId]);

  const fetchData = async () => {
    try {
      const [examRes, studentRes, subExamRes, resultRes, gradeRes] = await Promise.all([
        api.get(`/exams/${examId}/`),
        api.get(`/students/${studentId}/`),
        api.get('/exams/subject-exams/'),
        api.get('/exams/results/'),
        api.get('/exams/grades/')
      ]);

      setExam(examRes.data);
      setStudent(studentRes.data);

      const examSubjects = subExamRes.data.filter(se => se.exam.toString() === examId.toString());
      const studentResults = resultRes.data.filter(r => r.exam.toString() === examId.toString() && r.student.toString() === studentId.toString());
      const grades = gradeRes.data.sort((a, b) => b.gpa_value - a.gpa_value);

      let data = [];
      let totalMarks = 0;
      let totalGpa = 0;
      let hasFailed = false;

      examSubjects.forEach(sub => {
        const res = studentResults.find(r => r.subject === sub.subject);
        if (res) {
          const gradeObj = grades.find(g => g.id === res.grade);
          const gpa = gradeObj ? Number(gradeObj.gpa_value) : 0;
          data.push({
            subject: sub.subject_name,
            full: sub.full_marks,
            pass: sub.pass_marks,
            obtained: res.marks_obtained,
            grade: gradeObj ? gradeObj.name : '-',
            gpa: gpa
          });
          totalMarks += Number(res.marks_obtained);
          totalGpa += gpa;
          if (gpa === 0) hasFailed = true;
        } else {
          data.push({
            subject: sub.subject_name,
            full: sub.full_marks, pass: sub.pass_marks, obtained: '-', grade: '-', gpa: '-'
          });
        }
      });

      setMarksData(data);

      let finalGpa = 0;
      let finalGrade = 'N/A';
      
      if (studentResults.length < examSubjects.length) {
        finalGrade = 'Incomplete';
      } else if (hasFailed) {
        finalGrade = 'F';
      } else if (examSubjects.length > 0) {
        const avgGpa = (totalGpa / examSubjects.length).toFixed(2);
        finalGpa = avgGpa;
        const matchedGrade = grades.find(g => Number(g.gpa_value) <= Number(avgGpa));
        finalGrade = matchedGrade ? matchedGrade.name : 'F';
      }

      setSummary({ total: totalMarks, gpa: finalGpa, grade: finalGrade });

    } catch (error) {
      console.error("Error fetching marksheet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintMarksheet = async () => {
    try {
      const response = await api.get(`/exams/marksheet/pdf/${examId}/${studentId}/`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate Marksheet PDF.");
    }
  };

  if (isLoading) return <div className="text-center py-20 font-bold text-gray-500">Loading Marksheet...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-10">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Academic Marksheet</h1>
          <p className="text-gray-500 text-sm mt-1">Individual performance report.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
            ← Back
          </button>
          <button onClick={handlePrintMarksheet} className="px-5 py-2.5 bg-brand-royalPurple text-white font-bold rounded-xl hover:bg-brand-deepPlum transition flex items-center gap-2 shadow-sm">
            <span>🖨️</span> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Student Name</p>
            <p className="text-lg font-bold text-brand-deepPlum">{student?.name}</p>
            <p className="text-sm text-gray-600 mt-1">ID: {student?.student_id} | Roll: {student?.roll_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-semibold mb-1">Examination</p>
            <p className="text-lg font-bold text-brand-deepPlum">{exam?.name} ({exam?.academic_year})</p>
            <p className="text-sm text-gray-600 mt-1">Class: {student?.class_level_name} - {student?.section_name}</p>
          </div>
        </div>

        <table className="w-full text-center border-collapse border border-gray-200 mb-8">
          <thead>
            <tr className="bg-brand-deepPlum text-white">
              <th className="p-3 border border-white/20 text-left">Subject</th>
              <th className="p-3 border border-white/20">Full Marks</th>
              <th className="p-3 border border-white/20">Pass Marks</th>
              <th className="p-3 border border-white/20">Obtained</th>
              <th className="p-3 border border-white/20">Grade</th>
              <th className="p-3 border border-white/20">GPA</th>
            </tr>
          </thead>
          <tbody>
            {marksData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 border-b border-gray-200">
                <td className="p-3 border-r border-gray-200 font-bold text-gray-800 text-left">{row.subject}</td>
                <td className="p-3 border-r border-gray-200 text-gray-600">{Number(row.full)}</td>
                <td className="p-3 border-r border-gray-200 text-gray-600">{Number(row.pass)}</td>
                <td className="p-3 border-r border-gray-200 font-bold text-brand-deepPlum">{row.obtained}</td>
                <td className={`p-3 border-r border-gray-200 font-bold ${row.grade === 'F' ? 'text-red-500' : 'text-[#0e5c3c]'}`}>{row.grade}</td>
                <td className={`p-3 font-bold ${row.gpa === 0 ? 'text-red-500' : 'text-[#0e5c3c]'}`}>{row.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Marks</p>
            <p className="text-2xl font-black text-brand-deepPlum">{summary.total}</p>
          </div>
          <div className="bg-brand-mintGreen/10 p-4 rounded-xl border border-brand-tealCyan/30">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">GPA</p>
            <p className="text-2xl font-black text-[#0e5c3c]">{summary.gpa}</p>
          </div>
          <div className={`p-4 rounded-xl border ${summary.grade === 'F' || summary.grade === 'Incomplete' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Final Grade</p>
            <p className={`text-2xl font-black ${summary.grade === 'F' || summary.grade === 'Incomplete' ? 'text-red-600' : 'text-blue-600'}`}>
              {summary.grade}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}