"""Initial migration - all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('avatar_url', sa.Text, nullable=True),
        sa.Column('language', sa.String(2), server_default='ar'),
        sa.Column('google_id', sa.String(255), nullable=True, unique=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # User AI Settings
    op.create_table(
        'user_ai_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('provider', sa.String(20), nullable=False),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('api_key_encrypted', sa.Text, nullable=False),
        sa.Column('is_active', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Subjects
    op.create_table(
        'subjects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('color', sa.String(7), server_default='#6C63FF'),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('exam_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reminder_enabled', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_subjects_user_id', 'subjects', ['user_id'])

    # Chapters
    op.create_table(
        'chapters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('order_index', sa.Integer, server_default='0'),
        sa.Column('is_auto_detected', sa.Boolean, server_default='false'),
        sa.Column('progress_percentage', sa.Float, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_chapters_subject_id', 'chapters', ['subject_id'])

    # Files
    op.create_table(
        'files',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('chapter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chapters.id', ondelete='CASCADE'), nullable=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('original_name', sa.String(255), nullable=False),
        sa.Column('file_type', sa.String(10), nullable=False),
        sa.Column('storage_url', sa.Text, nullable=False),
        sa.Column('extracted_text', sa.Text, nullable=True),
        sa.Column('processing_status', sa.String(20), server_default='pending'),
        sa.Column('file_size_bytes', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_files_chapter_id', 'files', ['chapter_id'])
    op.create_index('idx_files_subject_id', 'files', ['subject_id'])

    # Generated Contents
    op.create_table(
        'generated_contents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('chapter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chapters.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content_type', sa.String(20), nullable=False),
        sa.Column('content_data', postgresql.JSONB, nullable=False),
        sa.Column('ai_provider', sa.String(50), nullable=True),
        sa.Column('ai_model', sa.String(100), nullable=True),
        sa.Column('detail_level', sa.String(20), server_default='medium'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_generated_contents_chapter_id', 'generated_contents', ['chapter_id'])

    # Exam Results
    op.create_table(
        'exam_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chapter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chapters.id', ondelete='SET NULL'), nullable=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='SET NULL'), nullable=True),
        sa.Column('exam_type', sa.String(20), nullable=False),
        sa.Column('score', sa.Float, nullable=False),
        sa.Column('total_questions', sa.Integer, nullable=False),
        sa.Column('correct_answers', sa.Integer, nullable=False),
        sa.Column('time_taken_seconds', sa.Integer, nullable=True),
        sa.Column('questions_data', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_exam_results_user_id', 'exam_results', ['user_id'])

    # Flashcard Progress
    op.create_table(
        'flashcard_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('flashcard_id', sa.String(100), nullable=False),
        sa.Column('chapter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chapters.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(10), server_default='review'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'flashcard_id', 'chapter_id', name='uq_user_flashcard_chapter'),
    )

    # Notifications
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='SET NULL'), nullable=True),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text, nullable=True),
        sa.Column('is_read', sa.Boolean, server_default='false'),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_notifications_user_read', 'notifications', ['user_id', 'is_read'])

    # Chat Messages
    op.create_table(
        'chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chapter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chapters.id', ondelete='SET NULL'), nullable=True),
        sa.Column('role', sa.String(10), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_chat_messages_subject', 'chat_messages', ['user_id', 'subject_id'])


def downgrade() -> None:
    op.drop_table('chat_messages')
    op.drop_table('notifications')
    op.drop_table('flashcard_progress')
    op.drop_table('exam_results')
    op.drop_table('generated_contents')
    op.drop_table('files')
    op.drop_table('chapters')
    op.drop_table('subjects')
    op.drop_table('user_ai_settings')
    op.drop_table('users')
