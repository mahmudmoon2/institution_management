import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../../api/axios';

export default function Marksheet() {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMarksheetData();
  }, [examId, studentId]);

  const fetchMarksheetData = async () => {
    try {
      const [stuRes, examRes, subExamRes, resultRes, gradeRes] = await Promise.all([
        api.get(`/students/${studentId}/`),
        api.get(`/exams/${examId}/`),
        api.get('/exams/subject-exams/'),
        api.get('/exams/results/'),
        api.get('/exams/grades/')
      ]);

      setStudent(stuRes.data);
      setExam(examRes.data);
      
      const filteredSubExams = subExamRes.data.filter(se => se.exam.toString() === examId);
      setSubjectExams(filteredSubExams);
      
      const filteredResults = resultRes.data.filter(r => r.exam.toString() === examId && r.student.toString() === studentId);
      setResults(filteredResults);
      
      setGrades(gradeRes.data.sort((a, b) => b.gpa_value - a.gpa_value));

    } catch (error) {
      console.error("Error fetching marksheet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // সাবজেক্টের মার্কস খোঁজার ফাংশন
  const getResultForSubject = (subjectId) => {
    return results.find(r => r.subject === subjectId);
  };

  // ফাইনাল রেজাল্ট হিসাব করা
  const calculateFinal = () => {
    if (results.length === 0) return { total: 0, gpa: 0, grade: 'N/A' };

    let totalMarks = 0;
    let totalGpa = 0;
    let hasFailed = false;

    results.forEach(r => {
      totalMarks += Number(r.marks_obtained);
      const gradeObj = grades.find(g => g.id === r.grade);
      const gpa = gradeObj ? Number(gradeObj.gpa_value) : 0;
      totalGpa += gpa;
      if (gpa === 0) hasFailed = true; 
    });

    if (results.length < subjectExams.length) return { total: totalMarks, gpa: 0, grade: 'Incomplete' };
    if (hasFailed) return { total: totalMarks, gpa: 0, grade: 'F' };

    const avgGpa = (totalGpa / subjectExams.length).toFixed(2);
    const finalGradeObj = grades.find(g => Number(g.gpa_value) <= Number(avgGpa)) || { name: 'F' };

    return { total: totalMarks, gpa: avgGpa, grade: finalGradeObj.name };
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-brand-deepPlum">Generating Marksheet...</div>;
  if (!student || !exam) return <div className="p-10 text-center font-bold text-red-500">Data not found!</div>;

  const finalResult = calculateFinal();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Top Actions (Hidden on Print) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-brand-deepPlum font-semibold px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          ← Back to Tabulation
        </button>
        <button onClick={() => window.print()} className="bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
          <span>🖨️</span> Print Marksheet
        </button>
      </div>

      {/* Printable Marksheet Area */}
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header Section */}
        <div className="text-center border-b-2 border-brand-deepPlum pb-6 mb-8">
          <div className="w-20 h-20 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3 border-4 border-brand-tealCyan shadow-sm">
            DIA
          </div>
          <h1 className="text-3xl font-bold text-brand-deepPlum uppercase tracking-widest">Ideal Academy</h1>
          <p className="text-sm text-gray-500 font-semibold tracking-widest mt-1">ACADEMIC TRANSCRIPT</p>
          <h2 className="text-xl font-bold text-brand-royalPurple mt-4">{exam.name} - {exam.academic_year}</h2>
        </div>

        {/* Student Info & QR Code */}
        <div className="flex justify-between items-start mb-8 bg-[#F5F0FF] p-6 rounded-xl border border-brand-softLavender/30">
          <div className="space-y-2 text-sm">
            <p><span className="font-bold text-gray-500 w-32 inline-block">Student Name:</span> <span className="font-bold text-brand-deepPlum text-lg">{student.name}</span></p>
            <p><span className="font-bold text-gray-500 w-32 inline-block">Student ID:</span> <span className="font-bold text-gray-800">{student.student_id}</span></p>
            <p><span className="font-bold text-gray-500 w-32 inline-block">Class & Section:</span> <span className="font-bold text-gray-800">{exam.class_level_name} - {student.section_name || 'A'}</span></p>
            <p><span className="font-bold text-gray-500 w-32 inline-block">Roll Number:</span> <span className="font-bold text-gray-800">{student.roll_number}</span></p>
          </div>
          <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <QRCode value={`Verify: ${student.student_id} | Exam: ${exam.name} | GPA: ${finalResult.gpa}`} size={80} level="L" />
            <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Scan to Verify</span>
          </div>
        </div>

        {/* Grades Table */}
        <div className="overflow-hidden rounded-xl border border-gray-300 mb-8">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-brand-deepPlum text-white">
                <th className="p-3 border-r border-white/20 w-12 text-center">SL</th>
                <th className="p-3 border-r border-white/20">Name of Subjects</th>
                <th className="p-3 border-r border-white/20 text-center w-24">Full Marks</th>
                <th className="p-3 border-r border-white/20 text-center w-28">Marks Obtained</th>
                <th className="p-3 border-r border-white/20 text-center w-20">Letter Grade</th>
                <th className="p-3 text-center w-20">Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {subjectExams.map((sub, index) => {
                const res = getResultForSubject(sub.subject);
                const gradeObj = res ? grades.find(g => g.id === res.grade) : null;
                
                return (
                  <tr key={sub.id} className="border-b border-gray-200">
                    <td className="p-3 border-r border-gray-200 text-center font-semibold text-gray-500">{index + 1}</td>
                    <td className="p-3 border-r border-gray-200 font-bold text-gray-800">{sub.subject_name}</td>
                    <td className="p-3 border-r border-gray-200 text-center text-gray-600">{Number(sub.full_marks)}</td>
                    <td className="p-3 border-r border-gray-200 text-center font-bold text-brand-deepPlum">{res ? res.marks_obtained : '-'}</td>
                    <td className="p-3 border-r border-gray-200 text-center font-bold text-brand-tealCyan">{gradeObj ? gradeObj.name : '-'}</td>
                    <td className="p-3 text-center font-bold text-[#0e5c3c]">{gradeObj ? Number(gradeObj.gpa_value).toFixed(2) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Final Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-64 border border-gray-300 rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
              <span className="font-bold text-gray-600 text-sm">Total Marks</span>
              <span className="font-bold text-brand-deepPlum">{finalResult.total}</span>
            </div>
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
              <span className="font-bold text-gray-600 text-sm">Grade Point Average</span>
              <span className="font-bold text-[#0e5c3c] text-lg">{finalResult.gpa}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-brand-royalPurple text-white">
              <span className="font-bold text-sm">Final Grade</span>
              <span className="font-bold text-xl">{finalResult.grade}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end pt-8">
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 mb-2"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Class Teacher</p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 mb-2"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Controller of Exams</p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 mb-2"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Headmaster / Principal</p>
          </div>
        </div>

      </div>
    </div>
  );
}